import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/checklist.css'
import {
  getStoredChecklistManagementRecords,
  saveChecklistManagementRecords,
} from '../utils/checklistStatusStorage'
import { resolveMediaUrl } from '../utils/mediaUrl'

const today = '2026-07-25'
const API_BASE_URL = 'http://127.0.0.1:8000'

function createKey(prefix, id) {
  return `${prefix}-${id}`
}

function normalizeActionStatus(status) {
  if (status === '조치 완료') return '조치 완료'
  return '조치 대기'
}

function isAssignedAction(task) {
  return Boolean(task.assignee && task.assignee !== '미배정')
}

function sortTasksByCompletion(tasks, view) {
  return [...tasks].sort((a, b) => {
    const aCompleted = view === 'inspection' ? a.inspectionStatus === '점검 완료' : a.status === '조치 완료'
    const bCompleted = view === 'inspection' ? b.inspectionStatus === '점검 완료' : b.status === '조치 완료'

    return Number(aCompleted) - Number(bCompleted)
  })
}

function getActionName(name = '', location = '') {
  if (!location || !name.startsWith(location)) return name

  return name
    .slice(location.length)
    .replace(/^[\s·\-_/|:]+/, '')
    .trim() || name
}

const ACTION_MOCK_DATA = [
  {
    id: 'action-1',
    taskKey: createKey('action', 'action-1'),
    inspectionRef: '비상구 앞 적치물 제거',
    inspectionLocation: 'B동 1층 현관',
    inspectionDate: today,
    inspector: '이안전',
    category: '시설 안전',
    text: '비상구 앞 적치물 제거',
    location: 'B동 1층 현관',
    risk: '높음',
    date: today,
    status: '조치 대기',
    assignee: '미배정',
    inspectionContent: '피난 동선을 막는 박스와 자재를 이동해야 합니다.',
    content: '',
    completed: false,
  },
  {
    id: 'action-2',
    taskKey: createKey('action', 'action-2'),
    inspectionRef: '방화문 폐쇄 상태 점검',
    inspectionLocation: 'A동 2층 복도',
    inspectionDate: today,
    inspector: '이안전',
    category: '소방 안전',
    text: '방화문 폐쇄 상태 개선',
    location: 'A동 2층 복도',
    risk: '중',
    date: today,
    status: '조치 완료',
    assignee: '박동준',
    inspectionContent: '방화문 주변 장애물이 있어 자동 폐쇄 상태 확인이 필요합니다.',
    content: '방화문 주변 장애물을 제거하고 자동 폐쇄 상태를 확인했습니다.',
    completed: true,
    photoNames: ['fire-door-after.jpg'],
  },
]

function toActionTask(record) {
  const actionName = getActionName(record.name, record.location)
  const isCompleted = normalizeActionStatus(record.progress) === '조치 완료'
  const actionHistoryPhotos = (record.actionHistory || [])
    .map((history) => history.completedPhoto)
    .filter(Boolean)
    .map((url, index) => ({ name: record.photoNames?.[index] || `조치완료 사진 ${index + 1}`, url: resolveMediaUrl(url) }))
  const photos = Array.isArray(record.photos) && record.photos.length
    ? record.photos.map((photo, index) => ({
      name: photo.name || record.photoNames?.[index] || `조치완료 사진 ${index + 1}`,
      url: resolveMediaUrl(typeof photo === 'string' ? photo : photo.url),
    }))
    : actionHistoryPhotos

  return {
    id: record.id,
    taskKey: createKey('action-record', record.id),
    inspectionRef: actionName,
    inspectionLocation: record.location,
    inspectionDate: record.date,
    inspector: record.completedBy || '이안전',
    category: record.category || '미분류',
    text: actionName,
    location: record.location,
    risk: record.level || '-',
    date: record.date,
    status: normalizeActionStatus(record.progress),
    assignee: record.assignee || record.actionAssignee || '미배정',
    inspectionContent: record.inspectionContent || record.note || '',
    content: record.actionContent || (isCompleted ? record.note : ''),
    completed: isCompleted,
    photoNames: record.photoNames || (photos.length ? photos.map((photo) => photo.name) : (record.photo ? ['attached-photo.jpg'] : [])),
    photos,
  }
}

function toInspectionTask(record) {
  return {
    id: record.id,
    taskKey: createKey('inspection-record', record.id),
    text: record.name,
    location: record.location,
    date: record.dateTime?.slice(0, 10) || today,
    inspectedAt: record.dateTime?.slice(0, 10) || today,
    inspector: record.inspectionAssignee || '미배정',
    category: record.category || '미분류',
    inspectionStatus: record.progress || '점검 대기',
    movedToAction: false,
    description: record.inspectionContent || record.description || record.note || '',
    inspectorMemo: record.historyContent || '',
  }
}

function getInspectionDescription(item) {
  return item.inspection?.content
    || item.inspection_content
    || item.checklist?.content
    || item.checklist_content
    || item.description
    || ''
}

function getInspectionMemo(item) {
  return item.history_content
    || item.inspection_history_content
    || item.memo
    || item.content
    || ''
}

function getActionContent(item) {
  return item.action_content
    || item.actionContent
    || item.content
    || ''
}

function getNextInspectionDate(dateTime, cycle) {
  const next = new Date(String(dateTime || '').replace(' ', 'T'))
  if (Number.isNaN(next.getTime())) return null

  if (cycle === '매일') next.setDate(next.getDate() + 1)
  else if (cycle === '매주') next.setDate(next.getDate() + 7)
  else if (cycle === '매월') next.setMonth(next.getMonth() + 1)
  else return null

  const pad = (value) => String(value).padStart(2, '0')
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}:00`
}

function isSameScheduledMinute(left, right) {
  return String(left || '').replace(' ', 'T').slice(0, 16) === String(right || '').replace(' ', 'T').slice(0, 16)
}

function getTodayDateKey() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function buildInspectionCatalog(items) {
  const byId = new Map()
  const byName = new Map()
  const byCategoryId = new Map()

  items.forEach((item) => {
    const record = {
      id: item.inspection_id ?? item.id,
      name: item.name,
      categoryId: item.category_id,
      cycle: item.cycle,
      content: item.content || '',
    }

    if (record.id != null) byId.set(String(record.id), record)
    if (record.name) byName.set(record.name, record)
    if (record.categoryId != null && !byCategoryId.has(String(record.categoryId))) byCategoryId.set(String(record.categoryId), record)
  })

  return { byId, byName, byCategoryId }
}

function getCatalogInspection(item, catalog) {
  const id = item.inspection_id ?? item.inspection?.inspection_id ?? item.checklist_id
  const categoryId = item.category_id ?? item.inspection?.category_id
  return (id != null ? catalog.byId.get(String(id)) : null)
    || catalog.byName.get(item.name)
    || (categoryId != null ? catalog.byCategoryId.get(String(categoryId)) : null)
    || null
}

function toManagementActionQueueRecord(action) {
  return {
    id: `action-queue-${action.id}`,
    name: action.inspectionRef || action.text,
    category: action.category || '시설 안전',
    location: action.inspectionLocation || action.location || '현장 구역',
    cycle: '매주',
    inspectionAssignee: action.inspector || '미배정',
    actionAssignee: '',
    dateTime: `${action.date || today} 09:00`,
    progress: '조치 대기',
    source: 'checklist-action',
    inspectionContent: action.inspectionContent || action.content || '점검 결과에 따라 조치가 필요한 항목입니다.',
    actionContent: '',
    note: action.inspectionContent || action.content || '점검 결과에 따라 조치가 필요한 항목입니다.',
  }
}

function getInitialActionTasks() {
  const managementActions = getStoredChecklistManagementRecords()
    .filter((record) => ['조치 대기', '조치 완료'].includes(record.progress))
    .map(toActionTask)

  return managementActions
}

function getInitialInspectionTasks() {
  return getStoredChecklistManagementRecords()
    .filter((record) => record.type === 'inspection' && record.progress === '점검 대기' && record.inspectionAssignee && record.inspectionAssignee !== '미배정')
    .map(toInspectionTask)
}

function ChecklistPage() {
  const [inspectionTasks, setInspectionTasks] = useState([])
  const [actionTasks, setActionTasks] = useState([])
  const [taskRefreshKey, setTaskRefreshKey] = useState(0)
  const [activeTaskView, setActiveTaskView] = useState('inspection')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [actionContent, setActionContent] = useState('')
  const [actionDetailContent, setActionDetailContent] = useState('')
  const [actionPhotoFiles, setActionPhotoFiles] = useState([])
  const [actionPhotoFilesByTask, setActionPhotoFilesByTask] = useState({})
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const actionPhotoInputRef = useRef(null)
  const isApiActionTasksLoaded = useRef(false)
  const completingInspectionIds = useRef(new Set())

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/api/checklists`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!Array.isArray(response.data) || !response.data.length) return

        const inspections = []
        const actions = []
        response.data.forEach((item, index) => {
          const id = item.checklist_id ?? item.id ?? index
          const isAction = item.type === '조치' || ['미조치', '조치 대기', '조치 중', '조치 필요', '조치 완료', '승인 대기', '승인 완료'].includes(item.status)
          const task = {
            id,
            taskKey: createKey(isAction ? 'action' : 'inspection', id),
            text: item.name || item.inspection_name || item.content || '점검 항목',
            location: item.location || (item.camera_id ? `CCTV #${item.camera_id} 구역` : '현장 구역'),
            date: item.date ? String(item.date).slice(0, 10) : today,
            inspectedAt: item.inspected_at ? String(item.inspected_at).slice(0, 10) : (item.date ? String(item.date).slice(0, 10) : today),
            inspector: item.inspector || item.manager_name || item.manager || '미지정',
          }
          if (isAction) {
            actions.push({ ...task, inspectionRef: item.inspection_name || item.name || '점검 항목', inspectionLocation: item.location || '현장 구역', category: item.risk_category || '시설 안전', risk: item.risk_level || '-', status: normalizeActionStatus(item.status), assignee: item.assignee || item.manager_name || item.manager || '미지정', inspectionContent: item.inspection_content || item.content || '', content: item.action_content || '', photos: item.image_url ? [{ name: '첨부 사진', url: resolveMediaUrl(item.image_url) }] : [], completed: ['조치 완료', '승인 대기', '승인 완료'].includes(item.status) })
          } else {
            inspections.push({ ...task, category: item.risk_category || item.category || '미분류', inspectionStatus: item.status || '점검 대기', movedToAction: Boolean(item.moved_to_action), description: getInspectionDescription(item) || item.content || '', inspectorMemo: item.history_content || '' })
          }
        })
        if (inspections.length) setInspectionTasks(inspections)
        if (actions.length) { setActionTasks(actions); isApiActionTasksLoaded.current = true }
      } catch (error) {
        console.warn('체크리스트 API 조회에 실패해 기존 데이터를 표시합니다.', error)
      }
    }
    fetchChecklists()
  }, [])

  useEffect(() => {
    const syncAssignedActions = () => {
      setTaskRefreshKey((current) => current + 1)
    }

    window.addEventListener('focus', syncAssignedActions)
    window.addEventListener('storage', syncAssignedActions)
    window.addEventListener('checklist-management-records-updated', syncAssignedActions)

    return () => {
      window.removeEventListener('focus', syncAssignedActions)
      window.removeEventListener('storage', syncAssignedActions)
      window.removeEventListener('checklist-management-records-updated', syncAssignedActions)
    }
  }, [])

  useEffect(() => {
    const loadMyTasks = async () => {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      try {
        const [inspectionResponse, actionResponse, catalogResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/inspection/histories/me`, { headers }),
          axios.get(`${API_BASE_URL}/api/action-histories/me`, { headers }),
          axios.get(`${API_BASE_URL}/api/inspection`, { headers }),
        ])
        const inspections = Array.isArray(inspectionResponse.data) ? inspectionResponse.data : []
        const actions = Array.isArray(actionResponse.data?.items) ? actionResponse.data.items : []
        const catalog = buildInspectionCatalog(Array.isArray(catalogResponse.data) ? catalogResponse.data : [])
        const mappedInspections = inspections.map((item) => {
          const catalogInspection = getCatalogInspection(item, catalog)

          return {
            id: item.inspection_history_id, taskKey: createKey('inspection', item.inspection_history_id),
            text: item.name || catalogInspection?.name || '점검 항목', location: item.location || '현장 구역',
            date: String(item.date || '').slice(0, 10), inspectedAt: String(item.date || '').slice(0, 10),
            inspector: item.user_name || '담당자', category: item.category_name || '정기 점검',
            categoryId: item.category_id || 1, inspectionStatus: item.status || '점검 대기',
            inspectionId: item.inspection_id ?? catalogInspection?.id,
            uid: item.uid ?? null,
            cycle: catalogInspection?.cycle || item.inspection?.cycle || null,
            scheduledAt: item.date,
            movedToAction: Boolean(item.is_action_required), description: getInspectionDescription(item) || catalogInspection?.content || '', inspectorMemo: getInspectionMemo(item), completed: item.status === '점검 완료',
          }
        })
        setInspectionTasks(mappedInspections.filter((task) => {
          const scheduledDate = String(task.scheduledAt || '').slice(0, 10)
          if (task.inspectionStatus === '점검 완료') return scheduledDate === getTodayDateKey()
          return scheduledDate <= getTodayDateKey()
        }))
        const mappedActions = actions.map((item) => ({
          id: item.action_history_id, taskKey: createKey('action', item.action_history_id),
          inspectionRef: item.action_name, inspectionLocation: item.location || '현장 구역',
          text: item.action_name || '조치 항목', location: item.location || '현장 구역',
          date: String(item.created_at || '').slice(0, 10), category: item.category_name || '기타',
          risk: item.risk_level || '-',
          status: item.action_status || '조치 대기', assignee: item.handler_name || '', content: getActionContent(item),
          inspectionContent: item.inspection_content || item.inspection_history_content || item.source_content || '',
          completed: item.action_status === '조치 완료', photos: item.image_url ? [{ name: '조치 사진', url: resolveMediaUrl(item.image_url) }] : [],
        }))
        setActionTasks((current) => mappedActions.map((action) => {
          const previous = current.find((task) => String(task.id) === String(action.id) || task.taskKey === action.taskKey)
          return { ...action, content: action.content || previous?.content || '', photos: action.photos.length ? action.photos : previous?.photos || [] }
        }))
        isApiActionTasksLoaded.current = true
      } catch (error) {
        console.warn('내 점검·조치 이력을 불러오지 못했습니다.', error)
      }
    }
    loadMyTasks()
  }, [taskRefreshKey])

  const rawVisibleTasks = activeTaskView === 'inspection' ? inspectionTasks : actionTasks.filter(isAssignedAction)
  const visibleTasks = sortTasksByCompletion(rawVisibleTasks, activeTaskView)
  const visibleActionCount = actionTasks.filter(isAssignedAction).length
  const selectableTasks = visibleTasks
  const effectiveSelectedTaskId = selectableTasks.some((task) => task.taskKey === selectedTaskId)
    ? selectedTaskId
    : selectableTasks[0]?.taskKey
  const currentTask = selectableTasks.find((task) => task.taskKey === effectiveSelectedTaskId)
  const currentTaskKey = currentTask?.taskKey
  const currentTaskContent = currentTask?.content || currentTask?.actionContent || ''
  const currentTaskPhotos = useMemo(() => currentTask?.photos || [], [currentTask?.photos])

  const progress = useMemo(() => {
    const done = activeTaskView === 'inspection'
      ? inspectionTasks.filter((task) => task.inspectionStatus === '점검 완료' || task.movedToAction).length
      : actionTasks.filter((task) => task.status === '조치 완료').length
    return { done, total: visibleTasks.length, percent: visibleTasks.length ? Math.round((done / visibleTasks.length) * 100) : 0 }
  }, [activeTaskView, actionTasks, inspectionTasks, visibleTasks.length])

  useEffect(() => {
    if (activeTaskView !== 'action' || !currentTaskKey) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActionDetailContent(currentTaskContent)
  }, [activeTaskView, currentTaskContent, currentTaskKey])

  useEffect(() => {
    if (activeTaskView !== 'action' || !currentTaskKey) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActionPhotoFiles(actionPhotoFilesByTask[currentTaskKey] ?? currentTaskPhotos)
  }, [actionPhotoFilesByTask, activeTaskView, currentTaskKey, currentTaskPhotos])

  const ensureNextInspectionHistory = async (task, headers) => {
    const nextDate = getNextInspectionDate(task.scheduledAt, task.cycle)
    if (!nextDate || !task.inspectionId || !task.uid) return false
    if (nextDate.slice(0, 10) > getTodayDateKey()) return false

    const hasNextHistory = (histories) => histories.some((history) => (
      isSameScheduledMinute(history.date, nextDate)
      && Number(history.uid) === Number(task.uid)
    ))
    const readHistories = async () => {
      const response = await axios.get(`${API_BASE_URL}/api/inspection/${task.inspectionId}/histories`, { headers })
      return Array.isArray(response.data) ? response.data : []
    }

    if (hasNextHistory(await readHistories())) return false

    const payload = {
      name: task.text,
      date: nextDate,
      location: task.location,
      uid: task.uid,
      user_name: task.inspector,
      status: '점검 대기',
      is_action_required: false,
      content: null,
      inspection_id: Number(task.inspectionId),
    }

    try {
      await axios.post(`${API_BASE_URL}/api/inspection/histories/create`, payload, { headers })
      return true
    } catch (error) {
      // 요청 응답만 유실된 경우를 대비해 한 번 더 조회하고, 이미 생성됐다면 중복으로 만들지 않습니다.
      if (hasNextHistory(await readHistories())) return false
      throw error
    }
  }

  const completeInspection = async () => {
    if (!currentTask || completingInspectionIds.current.has(currentTask.id)) return

    completingInspectionIds.current.add(currentTask.id)
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    try {
      await axios.patch(`${API_BASE_URL}/api/inspection/histories/${currentTask.id}`, {
        status: '점검 완료',
        is_action_required: false,
        content: actionContent.trim() || currentTask.inspectorMemo || undefined,
      }, { headers })
      await ensureNextInspectionHistory(currentTask, headers)

      const nextSelectedTask = inspectionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.inspectionStatus !== '점검 완료' && !task.movedToAction)
      setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
        ? { ...task, inspectionStatus: '점검 완료', completed: true, inspectorMemo: actionContent.trim() || task.inspectorMemo }
        : task))
      setSelectedTaskId(nextSelectedTask?.taskKey ?? null)
      setTaskRefreshKey((current) => current + 1)
    } catch (error) {
      console.error('점검 완료 처리 또는 다음 점검 생성 실패:', error)
      alert(error.response?.data?.detail || '점검 완료 또는 다음 정기 점검 생성에 실패했습니다.')
    } finally {
      completingInspectionIds.current.delete(currentTask.id)
    }
  }

  const registerAction = async () => {
    if (!currentTask) return
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const content = actionContent.trim() || currentTask.inspectorMemo || 'Action is required for this inspection.'
    try {
      await axios.patch(`${API_BASE_URL}/api/inspection/histories/${currentTask.id}`, {
        status: '점검 완료', is_action_required: true, content,
      }, { headers })
      await axios.post(`${API_BASE_URL}/api/action-histories`, {
        source_type: '점검이력', source_id: currentTask.id, action_name: currentTask.text,
        category_id: currentTask.categoryId || 1, location: currentTask.location, content,
      }, { headers })
      setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
        ? { ...task, movedToAction: true, inspectionStatus: '점검 완료', completed: true, inspectorMemo: content }
        : task))
      setActionContent('')
      alert('담당자 배정으로 이동되었습니다. 담당자 배정 후 조치목록에 표시됩니다.')
      return
    } catch (error) {
      console.error('Action registration failed:', error)
      alert(error.response?.data?.detail || '조치 등록에 실패했습니다.')
      return
    }
    const actionId = Date.now()
    const action = {
      id: actionId,
      taskKey: createKey('action', actionId),
      inspectionRef: currentTask.text,
      inspectionLocation: currentTask.location,
      inspectionDate: currentTask.inspectedAt,
      inspector: currentTask.inspector,
      category: currentTask.category || '미분류',
      text: currentTask.text,
      location: currentTask.location,
      risk: '-',
      date: today,
      status: '조치 대기',
      assignee: '미배정',
      inspectionContent: currentTask.description || currentTask.inspectorMemo || actionContent.trim(),
      content: '',
      completed: false,
    }

    setActionTasks((current) => [action, ...current])
    const nextSelectedTask = inspectionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.inspectionStatus !== '점검 완료' && !task.movedToAction)
    setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? { ...task, movedToAction: true, inspectionStatus: '조치 등록 완료' }
      : task))
    setActionContent('')
    setSelectedTaskId(nextSelectedTask?.taskKey ?? null)
    const managementAction = toManagementActionQueueRecord(action)
    const managementRecords = getStoredChecklistManagementRecords()
    const remainingRecords = managementRecords.filter((item) => item.id !== managementAction.id)
    saveChecklistManagementRecords([managementAction, ...remainingRecords])
    alert('담당자 배정으로 이동되었습니다. 담당자 배정 후 조치목록에 표시됩니다.')
  }

  const handleActionPhotoChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length || !currentTask) return

    setActionPhotoFiles((current) => {
      const nextPhotos = [...current, ...files.map((file) => ({ file, name:file.name, url:URL.createObjectURL(file) }))]
      setActionPhotoFilesByTask((currentMap) => ({ ...currentMap, [currentTask.taskKey]: nextPhotos }))
      return nextPhotos
    })
    event.target.value = ''
  }

  const removeActionPhoto = (target) => setActionPhotoFiles((current) => {
    const nextPhotos = current.filter((photo) => {
      const shouldRemove = photo.url === target.url
      if (shouldRemove && photo.file) URL.revokeObjectURL(photo.url)
      return !shouldRemove
    })

    if (currentTask) {
      setActionPhotoFilesByTask((currentMap) => ({ ...currentMap, [currentTask.taskKey]: nextPhotos }))
    }

    return nextPhotos
  })

  const completeAction = async () => {
    if (!currentTask) return

    const completedContent = actionDetailContent.trim()

    if (!completedContent) {
      alert('조치내용을 입력해 주세요.')
      return
    }

    const attachedPhotos = actionPhotoFilesByTask[currentTask.taskKey] ?? actionPhotoFiles

    if (!attachedPhotos.length) {
      alert('조치 사진을 첨부해 주세요.')
      return
    }

    const photoToUpload = attachedPhotos.find((photo) => photo.file)
    if (!photoToUpload) {
      alert('새로 첨부한 조치 완료 사진이 필요합니다.')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('content', completedContent)
      formData.append('image', photoToUpload.file)
      const response = await axios.patch(`${API_BASE_URL}/api/action-histories/${currentTask.id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      const responseContent = response.data?.content || response.data?.action_content || ''
      const nextContent = responseContent || completedContent
      setActionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
        ? { ...task, status: '조치 완료', completed: true, content: nextContent }
        : task))
      setActionDetailContent(nextContent)
      return
    } catch (error) {
      console.error('Action completion failed:', error)
      alert(error.response?.data?.detail || '조치 완료 처리에 실패했습니다.')
      return
    }

    const nextSelectedTask = actionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.status !== '조치 완료')

    const completedTask = {
      ...currentTask,
      content: completedContent,
      photoNames: attachedPhotos.map((photo) => photo.name),
      photos: attachedPhotos.map(({ name, url }) => ({ name, url })),
      status: '조치 완료',
      completed: true,
    }

    setActionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? completedTask
      : task))

    const managementRecords = getStoredChecklistManagementRecords()
    const completedAt = new Date()
    const completedDateTime = `${completedAt.toISOString().slice(0, 10)} ${String(completedAt.getHours()).padStart(2, '0')}:${String(completedAt.getMinutes()).padStart(2, '0')}`
    saveChecklistManagementRecords(managementRecords.map((record) => (
      String(record.id) === String(currentTask.id)
        ? {
          ...record,
          progress: '조치 완료',
          dateTime: completedDateTime,
          actionContent: completedContent,
          note: record.inspectionContent || record.note,
          photo: true,
          photoNames: attachedPhotos.map((photo) => photo.name),
          photos: attachedPhotos.map(({ name, url }) => ({ name, url })),
          actionHistory: [
            {
              id: `action-history-${Date.now()}`,
              actionName: record.name,
              location: record.location,
              dateTime: completedDateTime,
              manager: record.actionAssignee || currentTask.assignee || '미배정',
              progress: '조치 완료',
              approvalStatus: '승인대기',
              completedPhoto: attachedPhotos[0]?.url || '',
              sourceReportId: record.sourceReportId,
            },
            ...(record.actionHistory || []),
          ],
        }
        : record
    )))

    setSelectedTaskId(nextSelectedTask?.taskKey ?? null)

    alert('조치가 완료되었습니다.')
  }

  return (
    <section className="checklist-page">
      <div className="checklist-grid">
        <article className="checklist-card">
          <div className="checklist-card-header">
            <div>
              <h2>점검 · 조치 목록</h2>
              <p>점검 결과를 확인하고 조치가 필요한 건을 등록하세요.</p>
            </div>
            <span className="task-badge-count">총 {visibleTasks.length}건</span>
          </div>

          <div className="daily-task-tabs" role="tablist" aria-label="점검 및 조치 목록 전환">
            <button className={activeTaskView === 'inspection' ? 'is-active' : ''} type="button" onClick={() => setActiveTaskView('inspection')}>
              점검 목록 <span>{inspectionTasks.length}</span>
            </button>
            <button
              className={activeTaskView === 'action' ? 'is-active' : ''}
              type="button"
              onClick={() => setActiveTaskView('action')}
            >
              조치 목록 <span>{visibleActionCount}</span>
            </button>
          </div>

          <div className="checklist-progress">
            <div><strong>전체 진행률</strong><span>{progress.done}/{progress.total} ({progress.percent}%)</span></div>
            <div className="progress-track"><span style={{ width: `${progress.percent}%` }} /></div>
          </div>

          <div className="task-list">
            {visibleTasks.map((task) => {
              const selected = task.taskKey === effectiveSelectedTaskId
              const status = activeTaskView === 'inspection' ? task.inspectionStatus : task.status
              const isCompletedInspection = activeTaskView === 'inspection' && (status === '점검 완료' || task.movedToAction)
              const isCompletedAction = activeTaskView === 'action' && status === '조치 완료'
              return (
                <button
                  className={`task-item ${selected ? 'is-selected' : ''} ${isCompletedInspection || isCompletedAction ? 'is-completed' : ''}`}
                  key={task.taskKey}
                  type="button"
                  onClick={() => setSelectedTaskId(task.taskKey)}
                >
                  <div className="task-item-content">
                    <span className="task-check">{task.movedToAction || task.completed ? '✓' : '·'}</span>
                    <div className="task-text-wrap"><span className="task-title">{task.text}</span><small className="task-meta">{task.location} | {task.date}</small></div>
                  </div>
                </button>
              )
            })}
            {!visibleTasks.length && <div className="checklist-empty">등록된 조치 항목이 없습니다.</div>}
          </div>
        </article>

        <article className="checklist-card action-card">
          {activeTaskView === 'inspection' && currentTask ? (
            <div className="action-registration-panel">
              <div className="strength-request-header">
                <span>ACTION REGISTRATION</span>
                <h2>완료/조치 등록</h2>
                <p>점검 이력에서 조치가 필요한 항목을 선택해 조치 업무로 등록합니다.</p>
              </div>
              <section className="inspection-reference-card">
                <div><span>이름</span><strong>{currentTask.text}</strong></div><div><span>현장 구역</span><strong>{currentTask.location}</strong></div>
                <div><span>위험도 카테고리</span><strong>{currentTask.category || '미분류'}</strong></div><div><span>진행 상황</span><strong>{currentTask.inspectionStatus}</strong></div>
                <div className="is-wide"><span>내용</span><strong>{currentTask.description || '등록된 내용이 없습니다.'}</strong></div>
              </section>

              {currentTask.movedToAction ? (
                <div className="action-already-registered">이 점검 건은 이미 조치 목록에 등록되어 있습니다.</div>
              ) : currentTask.completed || currentTask.inspectionStatus === '점검 완료' ? (
                <div className="action-already-registered">완료된 점검 항목입니다.</div>
              ) : (
                <div className="action-registration-form">
                  <label className="is-wide"><span>점검자 메모</span><textarea value={actionContent} onChange={(event) => setActionContent(event.target.value)} placeholder="점검 결과 또는 필요한 조치 내용을 입력하세요." rows="4" /></label>
                  <div className="inspection-result-actions">
                    <button className="inspection-complete-button" type="button" onClick={completeInspection}>점검 완료</button>
                    <button className="action-required-button" type="button" onClick={registerAction}>조치 필요</button>
                  </div>
                </div>
              )}
            </div>
          ) : currentTask ? (
            <div className="action-detail-panel">
              <div className="strength-request-header"><span>ACTION DETAIL</span><h2>조치내용</h2><p>점검 이력이 연결된 조치 업무입니다.</p></div>
              <section className="inspection-reference-card">
                <div><span>이름</span><strong>{currentTask.inspectionRef}</strong></div><div><span>위치</span><strong>{currentTask.inspectionLocation || currentTask.location}</strong></div>
                <div><span>위험도 카테고리</span><strong>{currentTask.category}</strong></div><div><span>위험도</span><strong>{currentTask.risk}</strong></div>
                <div><span>진행 상황</span><strong>{currentTask.status}</strong></div>
                <div><span>점검 담당자</span><strong>{currentTask.assignee}</strong></div>
                <div className="is-wide"><span>점검내용</span><strong>{currentTask.inspectionContent || '점검 시 입력한 내용이 없습니다.'}</strong></div>
              </section>
              <div className="action-registration-form">
                <label className="is-wide">
                  <span>조치내용</span>
                  <textarea value={actionDetailContent} readOnly={currentTask.completed} onChange={(event) => setActionDetailContent(event.target.value)} placeholder="수행한 조치 내용을 입력하세요." rows="5" />
                </label>
                {currentTask.completed ? (
                  <div className="upload-section">
                    <div className="upload-label">
                      <strong>조치완료 사진</strong>
                      <span>{actionPhotoFiles.length}장</span>
                    </div>
                    {actionPhotoFiles.length ? (
                      <div className="photo-grid">
                        {actionPhotoFiles.map((photo) => (
                          <div className="photo-preview" key={photo.url}>
                            <button type="button" aria-label={`${photo.name} 크게 보기`} onClick={() => setPreviewPhoto(photo)}>
                              <img src={photo.url} alt={photo.name} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="checklist-empty">등록된 사진이 없습니다.</div>
                    )}
                  </div>
                ) : (
                  <div className="upload-section">
                    <div className="upload-label">
                      <strong>사진 첨부</strong>
                      <span>{actionPhotoFiles.length}장</span>
                    </div>
                    <div className="photo-grid">{actionPhotoFiles.map((photo) => <div className="photo-preview" key={photo.url}><button type="button" aria-label={`${photo.name} 크게 보기`} onClick={() => setPreviewPhoto(photo)}><img src={photo.url} alt={photo.name} /></button><button className="delete-photo-button" type="button" aria-label={`${photo.name} 삭제`} onClick={() => removeActionPhoto(photo)}>×</button></div>)}<input ref={actionPhotoInputRef} type="file" accept="image/*" multiple hidden onChange={handleActionPhotoChange} /><button className="add-photo-button" type="button" aria-label="사진 추가" onClick={() => actionPhotoInputRef.current?.click()}>+</button></div>
                  </div>
                )}
                {!currentTask.completed && <button className="submit-action-button" type="button" onClick={completeAction}>조치완료</button>}
              </div>
            </div>
          ) : <div className="checklist-empty">목록에서 항목을 선택해 주세요.</div>}
        </article>
      </div>

      {previewPhoto && (
        <button className="image-modal" type="button" aria-label="사진 크게 보기 닫기" onClick={() => setPreviewPhoto(null)}>
          <img src={previewPhoto.url} alt={previewPhoto.name} />
        </button>
      )}
    </section>
  )
}

export default ChecklistPage
