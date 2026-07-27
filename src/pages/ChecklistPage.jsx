import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useMemo, useState } from 'react'
import { TODAY_INSPECTION_MOCK_DATA } from '../mocks/mockData'
import '../styles/checklist.css'
import {
  getStoredChecklistManagementRecords,
  saveChecklistManagementRecords,
} from '../utils/checklistStatusStorage'

const today = '2026-07-25'

function createKey(prefix, id) {
  return `${prefix}-${id}`
}

function normalizeActionStatus(status) {
  if (status === '조치 완료') return '조치 완료'
  return '조치 대기'
}

function getManagementRecordId(task, type) {
  const id = String(task.id)
  return id.startsWith(`${type}-`) || id.startsWith('management-') ? id : `${type}-${id}`
}

function isAssignedAction(task) {
  return Boolean(task.assignee && task.assignee !== '미배정')
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
    content: '피난 동선을 막는 박스와 자재를 이동해야 합니다.',
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
    content: '방화문 주변 장애물을 제거하고 자동 폐쇄 상태를 확인했습니다.',
    completed: true,
    photoNames: ['fire-door-after.jpg'],
  },
]

function toManagementRecord(task, type) {
  const isAction = type === 'action'
  const progress = isAction
    ? normalizeActionStatus(task.status)
    : task.inspectionStatus || '점검 대기'

  return {
    id: getManagementRecordId(task, type),
    name: isAction ? (task.inspectionRef || task.text) : task.text,
    location: isAction ? (task.inspectionLocation || task.location) : task.location,
    category: task.category || '점검 항목',
    assignee: isAction ? task.assignee || '' : '',
    completedBy: task.inspector || '이안전',
    date: isAction ? task.inspectionDate || task.date : task.inspectedAt || task.date,
    progress,
    assignment: task.assignee && task.assignee !== '미배정' ? '배정 완료' : '미배정',
    level: task.risk || '보통',
    photo: Boolean(task.photoNames?.length),
    images: [],
    note: task.content || '등록된 점검 항목입니다.',
  }
}

function toActionTask(record) {
  return {
    id: record.id,
    taskKey: createKey('action-record', record.id),
    inspectionRef: record.name,
    inspectionLocation: record.location,
    inspectionDate: record.date,
    inspector: record.completedBy || '이안전',
    category: record.category || '미분류',
    text: record.name,
    location: record.location,
    risk: record.level || '-',
    date: record.date,
    status: normalizeActionStatus(record.progress),
    assignee: record.assignee || '미배정',
    content: record.note || '',
    completed: normalizeActionStatus(record.progress) === '조치 완료',
    photoNames: record.photo ? ['attached-photo.jpg'] : [],
  }
}

function getInitialActionTasks() {
  const managementActions = getStoredChecklistManagementRecords()
    .filter((record) => ['조치 대기', '조치 완료'].includes(record.progress))
    .map(toActionTask)

  return managementActions.length ? managementActions : ACTION_MOCK_DATA
}

function ChecklistPage() {
  const [inspectionTasks, setInspectionTasks] = useState(() => TODAY_INSPECTION_MOCK_DATA.map((task) => ({
    ...task,
    taskKey: createKey('inspection', task.id),
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
  const [isCreateInspectionOpen, setIsCreateInspectionOpen] = useState(false)
  const [newInspection, setNewInspection] = useState({ text: '', location: '', date: today })
  const [isCreateActionOpen, setIsCreateActionOpen] = useState(false)
  const [newAction, setNewAction] = useState({ text: '', location: '', date: today, content: '' })

  useEffect(() => {
    const managementCreatedRecords = getStoredChecklistManagementRecords()
      .filter((record) => String(record.id).startsWith('management-'))
    const records = [
      ...managementCreatedRecords,
      ...inspectionTasks
        .filter((task) => !task.movedToAction)
        .map((task) => toManagementRecord(task, 'inspection')),
      ...actionTasks.map((task) => toManagementRecord(task, 'action')),
    ]

    saveChecklistManagementRecords(records)
  }, [actionTasks, inspectionTasks])

  useEffect(() => {
    const syncAssignedActions = () => {
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

  const visibleTasks = activeTaskView === 'inspection' ? inspectionTasks : actionTasks.filter(isAssignedAction)
  const visibleActionCount = actionTasks.filter(isAssignedAction).length
  const selectableTasks = activeTaskView === 'inspection'
    ? visibleTasks.filter((task) => task.inspectionStatus !== '점검 완료' && !task.movedToAction)
    : visibleTasks.filter((task) => task.status !== '조치 완료')
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
    setActionPhotoFiles([])
  }, [activeTaskView, currentTask])

  const completeInspection = () => {
    if (!currentTask) return
    const nextSelectedTask = inspectionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.inspectionStatus !== '점검 완료' && !task.movedToAction)

    setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? { ...task, inspectionStatus: '점검 완료', completed: true }
      : task))
    setSelectedTaskId(nextSelectedTask?.taskKey ?? null)
    setActionContent('')
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
      category: '미분류',
      text: currentTask.text,
      location: currentTask.location,
      risk: '-',
      date: today,
      status: '조치 대기',
      assignee: '미배정',
      content: actionContent.trim(),
      completed: false,
    }

    setActionTasks((current) => [action, ...current])
    const nextSelectedTask = inspectionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.inspectionStatus !== '점검 완료' && !task.movedToAction)
    setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? { ...task, movedToAction: true, inspectionStatus: '조치 등록 완료' }
      : task))
    setActionContent('')
    setSelectedTaskId(nextSelectedTask?.taskKey ?? null)
    alert('체크리스트 관리에 조치 대기 항목으로 등록되었습니다. 담당자 배정 후 조치 목록에 표시됩니다.')
  }

  const handleActionPhotoChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    setActionPhotoFiles(files)
  }

  const completeAction = () => {
    if (!currentTask) return

    if (!actionDetailContent.trim()) {
      alert('조치내용을 입력해 주세요.')
      return
    }

    if (!actionPhotoFiles.length) {
      alert('조치 사진을 첨부해 주세요.')
      return
    }

    const nextSelectedTask = actionTasks.find((task) => task.taskKey !== currentTask.taskKey && task.status !== '조치 완료')

    setActionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? {
        ...task,
        content: actionDetailContent.trim(),
        photoNames: actionPhotoFiles.map((file) => file.name),
        status: '조치 완료',
        completed: true,
      }
      : task))
    setSelectedTaskId(nextSelectedTask?.taskKey ?? null)

    alert('조치가 완료되었습니다.')
  }

  const createInspection = (event) => {
    event.preventDefault()
    if (!newInspection.text.trim() || !newInspection.location.trim()) {
      alert('점검 이름과 구역을 입력해 주세요.')
      return
    }
    const id = Date.now()
    const task = {
      id,
      taskKey: createKey('inspection', id),
      text: newInspection.text.trim(),
      location: newInspection.location.trim(),
      date: newInspection.date,
      inspectedAt: newInspection.date,
      inspector: '이안전',
      inspectionStatus: '점검 대기',
      movedToAction: false,
    }
    setInspectionTasks((current) => [task, ...current])
    setSelectedTaskId(task.taskKey)
    setNewInspection({ text: '', location: '', date: today })
    setIsCreateInspectionOpen(false)
  }

  const createAction = (event) => {
    event.preventDefault()
    if (!newAction.text.trim() || !newAction.location.trim()) {
      alert('조치 이름과 구역을 입력해 주세요.')
      return
    }
    const id = Date.now()
    const action = {
      id,
      taskKey: createKey('action', id),
      inspectionRef: '직접 등록 조치',
      inspectionLocation: newAction.location.trim(),
      text: newAction.text.trim(),
      location: newAction.location.trim(),
      date: newAction.date,
      status: '조치 대기',
      assignee: '미배정',
      content: newAction.content.trim(),
      completed: false,
    }
    setActionTasks((current) => [action, ...current])
    setSelectedTaskId(action.taskKey)
    setNewAction({ text: '', location: '', date: today, content: '' })
    setIsCreateActionOpen(false)
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
              onClick={() => {
                setActionTasks(getInitialActionTasks())
                setActiveTaskView('action')
              }}
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
              const isDisabled = activeTaskView === 'inspection'
                ? status === '점검 완료' || task.movedToAction
                : status === '조치 완료'
              return (
                <button
                  className={`task-item ${selected ? 'is-selected' : ''} ${isDisabled ? 'is-completed' : ''}`}
                  key={task.taskKey}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) setSelectedTaskId(task.taskKey)
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
            <button className="task-create-plus-button" type="button" aria-label={activeTaskView === 'inspection' ? '점검 항목 추가' : '조치 항목 추가'} onClick={() => activeTaskView === 'inspection' ? setIsCreateInspectionOpen(true) : setIsCreateActionOpen(true)}><AddRoundedIcon /></button>
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
                <div><span>점검 이름 (참조)</span><strong>{currentTask.inspectionRef}</strong></div><div><span>구역 (참조)</span><strong>{currentTask.inspectionLocation}</strong></div>
                <div><span>위험도 카테고리</span><strong>{currentTask.category}</strong></div><div><span>위험도</span><strong>{currentTask.risk}</strong></div>
                <div><span>조치 진행 상황</span><strong>{currentTask.status}</strong></div><div><span>담당자</span><strong>{currentTask.assignee}</strong></div>
              </section>
              <div className="action-registration-form">
                <label className="is-wide">
                  <span>조치내용</span>
                  <textarea value={actionDetailContent} onChange={(event) => setActionDetailContent(event.target.value)} placeholder="수행한 조치 내용을 입력하세요." rows="5" />
                </label>
                <div className="upload-section">
                  <div className="upload-label">
                    <strong>사진 첨부</strong>
                    <span>{actionPhotoFiles.length}장</span>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleActionPhotoChange} />
                  {actionPhotoFiles.length > 0 && (
                    <div className="action-photo-file-list">
                      {actionPhotoFiles.map((file) => <span key={`${file.name}-${file.lastModified}`}>{file.name}</span>)}
                    </div>
                  )}
                </div>
                <button className="submit-action-button" type="button" onClick={completeAction}>조치완료</button>
              </div>
            </div>
          ) : <div className="checklist-empty">목록에서 항목을 선택해 주세요.</div>}
        </article>
      </div>

      {isCreateInspectionOpen && <InspectionCreateModal form={newInspection} onChange={(field, value) => setNewInspection((current) => ({ ...current, [field]: value }))} onClose={() => setIsCreateInspectionOpen(false)} onSubmit={createInspection} />}
      {isCreateActionOpen && <ActionCreateModal form={newAction} onChange={(field, value) => setNewAction((current) => ({ ...current, [field]: value }))} onClose={() => setIsCreateActionOpen(false)} onSubmit={createAction} />}
    </section>
  )
}

function InspectionCreateModal({ form, onChange, onClose, onSubmit }) {
  return <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="assignment-modal checklist-create-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><header><div><span>INSPECTION CREATE</span><h3>점검 항목 추가</h3><p>점검 테이블에 새 항목을 등록합니다.</p></div><button type="button" aria-label="닫기" onClick={onClose}><CloseIcon /></button></header><form className="checklist-create-form" onSubmit={onSubmit}><label className="is-wide"><span>점검 이름</span><input value={form.text} onChange={(event) => onChange('text', event.target.value)} placeholder="예: 소방설비 점검" /></label><label><span>구역</span><input value={form.location} onChange={(event) => onChange('location', event.target.value)} placeholder="예: A동 1층 복도" /></label><label><span>점검 일자</span><input type="date" value={form.date} onChange={(event) => onChange('date', event.target.value)} /></label><footer><span>새 항목은 점검 대기 상태로 등록됩니다.</span><div><button type="button" onClick={onClose}>취소</button><button type="submit">추가</button></div></footer></form></section></div>
}

function ActionCreateModal({ form, onChange, onClose, onSubmit }) {
  return <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="assignment-modal checklist-create-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ACTION CREATE</span><h3>조치 항목 추가</h3><p>점검과 별도로 바로 처리할 조치 업무를 등록합니다.</p></div><button type="button" aria-label="닫기" onClick={onClose}><CloseIcon /></button></header><form className="checklist-create-form" onSubmit={onSubmit}><label className="is-wide"><span>조치 이름</span><input value={form.text} onChange={(event) => onChange('text', event.target.value)} placeholder="예: 소화기 압력 게이지 교체" /></label><label><span>구역</span><input value={form.location} onChange={(event) => onChange('location', event.target.value)} placeholder="예: CCTV #1 구역" /></label><label><span>조치 일자</span><input type="date" value={form.date} onChange={(event) => onChange('date', event.target.value)} /></label><label className="is-wide"><span>내용</span><textarea value={form.content} onChange={(event) => onChange('content', event.target.value)} placeholder="필요한 조치 내용을 입력하세요." rows="3" /></label><footer><span>새 항목은 조치 대기 상태로 등록됩니다.</span><div><button type="button" onClick={onClose}>취소</button><button type="submit">추가</button></div></footer></form></section></div>
}

export default ChecklistPage
