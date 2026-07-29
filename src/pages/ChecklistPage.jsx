import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TODAY_INSPECTION_MOCK_DATA } from '../mocks/mockData'
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
    photoNames: record.photo ? ['attached-photo.jpg'] : [],
  }
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

  return managementActions.length ? managementActions : ACTION_MOCK_DATA
}

function ChecklistPage() {
  const navigate = useNavigate()
  const [inspectionTasks, setInspectionTasks] = useState(() => TODAY_INSPECTION_MOCK_DATA.map((task) => ({
    ...task,
    taskKey: createKey('inspection', task.id),
    category: task.category || '미분류',
    inspectionStatus: task.status || '점검 대기',
    inspectedAt: task.date || today,
    inspector: '이안전',
    movedToAction: false,
  })))
  const [actionTasks, setActionTasks] = useState(getInitialActionTasks)
  const [activeTaskView, setActiveTaskView] = useState('inspection')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [actionContent, setActionContent] = useState('')
  const [actionDetailContent, setActionDetailContent] = useState('')
  const [actionPhotoFiles, setActionPhotoFiles] = useState([])
  const [actionPhotoFilesByTask, setActionPhotoFilesByTask] = useState({})
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const actionPhotoInputRef = useRef(null)
  const isApiActionTasksLoaded = useRef(false)

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
            text: item.content || item.name || '점검 항목',
            location: item.location || (item.camera_id ? `CCTV #${item.camera_id} 구역` : '현장 구역'),
            date: item.date ? String(item.date).slice(0, 10) : today,
            inspectedAt: item.inspected_at ? String(item.inspected_at).slice(0, 10) : (item.date ? String(item.date).slice(0, 10) : today),
            inspector: item.inspector || item.manager_name || item.manager || '미지정',
          }
          if (isAction) {
            actions.push({ ...task, inspectionRef: item.inspection_name || item.name || '점검 항목', inspectionLocation: item.location || '현장 구역', category: item.risk_category || '시설 안전', risk: item.risk_level || '-', status: normalizeActionStatus(item.status), assignee: item.assignee || item.manager_name || item.manager || '미지정', inspectionContent: item.inspection_content || item.content || '', content: item.action_content || '', photos: item.image_url ? [{ name: '첨부 사진', url: resolveMediaUrl(item.image_url) }] : [], completed: ['조치 완료', '승인 대기', '승인 완료'].includes(item.status) })
          } else {
            inspections.push({ ...task, category: item.risk_category || item.category || '미분류', inspectionStatus: item.status || '점검 대기', movedToAction: Boolean(item.moved_to_action) })
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
      if (isApiActionTasksLoaded.current) return
      const managementActions = getStoredChecklistManagementRecords()
        .filter((record) => ['조치 대기', '조치 완료'].includes(record.progress))
        .map(toActionTask)

      setActionTasks(managementActions.length ? managementActions : ACTION_MOCK_DATA)
    }

    window.addEventListener('focus', syncAssignedActions)
    window.addEventListener('storage', syncAssignedActions)

    return () => {
      window.removeEventListener('focus', syncAssignedActions)
      window.removeEventListener('storage', syncAssignedActions)
    }
  }, [])

  const rawVisibleTasks = activeTaskView === 'inspection' ? inspectionTasks : actionTasks.filter(isAssignedAction)
  const visibleTasks = sortTasksByCompletion(rawVisibleTasks, activeTaskView)
  const visibleActionCount = actionTasks.filter(isAssignedAction).length
  const selectableTasks = visibleTasks
  const effectiveSelectedTaskId = selectableTasks.some((task) => task.taskKey === selectedTaskId)
    ? selectedTaskId
    : selectableTasks[0]?.taskKey
  const currentTask = selectableTasks.find((task) => task.taskKey === effectiveSelectedTaskId)

  const progress = useMemo(() => {
    const done = activeTaskView === 'inspection'
      ? inspectionTasks.filter((task) => task.inspectionStatus === '점검 완료' || task.movedToAction).length
      : actionTasks.filter((task) => task.status === '조치 완료').length
    return { done, total: visibleTasks.length, percent: visibleTasks.length ? Math.round((done / visibleTasks.length) * 100) : 0 }
  }, [activeTaskView, actionTasks, inspectionTasks, visibleTasks.length])

  useEffect(() => {
    if (activeTaskView !== 'action' || !currentTask) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActionDetailContent(currentTask.content || '')
    setActionPhotoFiles(actionPhotoFilesByTask[currentTask.taskKey] ?? (currentTask.photos || []))
  }, [actionPhotoFilesByTask, activeTaskView, currentTask])

  const completeInspection = () => {
    if (!currentTask) return
    const nextSelectedTask = inspectionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.inspectionStatus !== '점검 완료' && !task.movedToAction)

    setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? { ...task, inspectionStatus: '점검 완료', completed: true }
      : task))
    setSelectedTaskId(nextSelectedTask?.taskKey ?? null)
  }

  const registerAction = () => {
    if (!currentTask) return
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
      inspectionContent: actionContent.trim(),
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
    navigate('/checklists/management')
    alert('체크리스트 관리에 조치 대기 항목으로 등록되었습니다. 담당자 배정 후 조치 목록에 표시됩니다.')
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

  const completeAction = () => {
    if (!currentTask) return

    if (!actionDetailContent.trim()) {
      alert('조치내용을 입력해 주세요.')
      return
    }

    const attachedPhotos = actionPhotoFilesByTask[currentTask.taskKey] ?? actionPhotoFiles

    if (!attachedPhotos.length) {
      alert('조치 사진을 첨부해 주세요.')
      return
    }

    const nextSelectedTask = actionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.status !== '조치 완료')

    const completedTask = {
      ...currentTask,
      content: actionDetailContent.trim(),
      photoNames: attachedPhotos.map((photo) => photo.name),
      photos: attachedPhotos.map(({ name, url }) => ({ name, url })),
      status: '조치 완료',
      completed: true,
    }

    setActionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? completedTask
      : task))

    const managementRecords = getStoredChecklistManagementRecords()
    saveChecklistManagementRecords(managementRecords.map((record) => (
      String(record.id) === String(currentTask.id)
        ? {
          ...record,
          progress: '조치 완료',
          actionContent: actionDetailContent.trim(),
          note: record.inspectionContent || record.note,
          photo: true,
          photoNames: attachedPhotos.map((photo) => photo.name),
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
              const isLocked = activeTaskView === 'inspection' && (status === '점검 완료' || task.movedToAction)
              const isCompletedAction = activeTaskView === 'action' && status === '조치 완료'
              return (
                <button
                  className={`task-item ${selected ? 'is-selected' : ''} ${isLocked || isCompletedAction ? 'is-completed' : ''}`}
                  key={task.taskKey}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    if (!isLocked) setSelectedTaskId(task.taskKey)
                  }}
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
                <h2>조치 등록</h2>
                <p>점검 이력에서 조치가 필요한 항목을 선택해 조치 업무로 등록합니다.</p>
              </div>
              <section className="inspection-reference-card">
                <div><span>이름</span><strong>{currentTask.text}</strong></div><div><span>현장 구역</span><strong>{currentTask.location}</strong></div>
                <div><span>위험도 카테고리</span><strong>{currentTask.category || '미분류'}</strong></div><div><span>진행 상황</span><strong>{currentTask.inspectionStatus}</strong></div>
              </section>

              {currentTask.movedToAction ? (
                <div className="action-already-registered">이 점검 건은 이미 조치 목록에 등록되어 있습니다.</div>
              ) : (
                <div className="action-registration-form">
                  <label className="is-wide"><span>내용</span><textarea value={actionContent} onChange={(event) => setActionContent(event.target.value)} placeholder="점검 결과 또는 필요한 조치 내용을 입력하세요." rows="4" /></label>
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
                <div><span>이름</span><strong>{currentTask.inspectionRef}</strong></div><div><span>현장 구역</span><strong>{currentTask.inspectionLocation}</strong></div>
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
                {!currentTask.completed && (
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
