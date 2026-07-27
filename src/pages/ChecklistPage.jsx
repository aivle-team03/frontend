import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { TODAY_INSPECTION_MOCK_DATA } from '../mocks/mockData'
import '../styles/checklist.css'

const today = '2026-07-25'
const API_BASE_URL = 'http://127.0.0.1:8000'

function createKey(prefix, id) {
  return `${prefix}-${id}`
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
  const [actionTasks, setActionTasks] = useState([])
  const [activeTaskView, setActiveTaskView] = useState('inspection')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [actionContent, setActionContent] = useState('')
  const [isCreateInspectionOpen, setIsCreateInspectionOpen] = useState(false)
  const [newInspection, setNewInspection] = useState({ text: '', location: '', date: today })

  useEffect(() => {
    const loadChecklists = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_BASE_URL}/api/checklists`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!Array.isArray(response.data) || response.data.length === 0) return

        const inspections = []
        const actions = []
        response.data.forEach((item, index) => {
          const isAction = item.type === '조치' || ['조치 대기', '조치 중', '조치 완료', '조치 필요'].includes(item.status)
          const id = item.checklist_id ?? item.id ?? index
          const task = {
            id,
            taskKey: createKey(isAction ? 'action' : 'inspection', id),
            text: item.content || '점검 항목',
            location: item.location || (item.camera_id ? `CCTV #${item.camera_id} 구역` : '현장 구역'),
            date: item.date ? String(item.date).slice(0, 10) : today,
            inspectedAt: item.inspected_at ? String(item.inspected_at).slice(0, 10) : (item.date ? String(item.date).slice(0, 10) : today),
            inspector: item.inspector || item.manager || '미지정',
          }
          if (isAction) {
            actions.push({
              ...task,
              inspectionRef: item.inspection_name || item.content || '점검 항목',
              inspectionLocation: item.location || '현장 구역',
              category: item.risk_category || '시설 안전',
              risk: item.risk_level || '중',
              status: item.status || '조치 대기',
              assignee: item.assignee || item.manager || '미지정',
              content: item.action_content || item.content || '',
              completed: item.status === '조치 완료',
            })
          } else {
            inspections.push({ ...task, inspectionStatus: item.status || '점검 대기', movedToAction: Boolean(item.moved_to_action) })
          }
        })
        if (inspections.length) setInspectionTasks(inspections)
        if (actions.length) setActionTasks(actions)
      } catch (error) {
        console.warn('체크리스트를 불러오지 못해 예시 데이터를 표시합니다.', error)
      }
    }
    loadChecklists()
  }, [])

  const visibleTasks = activeTaskView === 'inspection' ? inspectionTasks : actionTasks
  const effectiveSelectedTaskId = visibleTasks.some((task) => task.taskKey === selectedTaskId)
    ? selectedTaskId
    : visibleTasks[0]?.taskKey
  const currentTask = visibleTasks.find((task) => task.taskKey === effectiveSelectedTaskId)

  const progress = useMemo(() => {
    const done = activeTaskView === 'inspection'
      ? inspectionTasks.filter((task) => task.inspectionStatus === '점검 완료' || task.movedToAction).length
      : actionTasks.filter((task) => task.status === '조치 완료').length
    return { done, total: visibleTasks.length, percent: visibleTasks.length ? Math.round((done / visibleTasks.length) * 100) : 0 }
  }, [activeTaskView, actionTasks, inspectionTasks, visibleTasks.length])

  const completeInspection = () => {
    if (!currentTask) return
    setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? { ...task, inspectionStatus: '점검 완료', completed: true }
      : task))
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
    setInspectionTasks((current) => current.map((task) => task.taskKey === currentTask.taskKey
      ? { ...task, movedToAction: true, inspectionStatus: '조치 등록 완료' }
      : task))
    setActionContent('')
    setActiveTaskView('action')
    setSelectedTaskId(action.taskKey)
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
            <button className={activeTaskView === 'action' ? 'is-active' : ''} type="button" onClick={() => setActiveTaskView('action')}>
              조치 목록 <span>{actionTasks.length}</span>
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
              return (
                <button className={`task-item ${selected ? 'is-selected' : ''}`} key={task.taskKey} type="button" onClick={() => setSelectedTaskId(task.taskKey)}>
                  <div className="task-item-content">
                    <span className="task-check">{task.movedToAction || task.completed ? '✓' : '·'}</span>
                    <div className="task-text-wrap"><span className="task-title">{task.text}</span><small className="task-meta">{task.location} | {task.date}</small></div>
                  </div>
                  <span className="task-risk-score">{status}</span>
                </button>
              )
            })}
            {!visibleTasks.length && <div className="checklist-empty">등록된 조치 항목이 없습니다.</div>}
            {activeTaskView === 'inspection' && <button className="task-create-plus-button" type="button" aria-label="점검 항목 추가" onClick={() => setIsCreateInspectionOpen(true)}><AddRoundedIcon /></button>}
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

              <section className="inspection-reference-card" aria-label="점검 이력 참조">
                <div><span>점검 이름</span><strong>{currentTask.text}</strong></div>
                <div><span>구역</span><strong>{currentTask.location}</strong></div>
                <div><span>점검 일시</span><strong>{currentTask.inspectedAt}</strong></div>
                <div><span>담당자</span><strong>{currentTask.inspector}</strong></div>
                <div><span>점검 진행 상황</span><strong>{currentTask.inspectionStatus}</strong></div>
                <div><span>조치 전환</span><strong>{currentTask.movedToAction ? '등록 완료' : '등록 가능'}</strong></div>
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
              <div className="strength-request-header"><span>ACTION DETAIL</span><h2>등록된 조치</h2><p>점검 이력이 연결된 조치 업무입니다.</p></div>
              <section className="inspection-reference-card">
                <div><span>점검 이름 (참조)</span><strong>{currentTask.inspectionRef}</strong></div><div><span>구역 (참조)</span><strong>{currentTask.inspectionLocation}</strong></div>
                <div><span>위험도 카테고리</span><strong>{currentTask.category}</strong></div><div><span>위험도</span><strong>{currentTask.risk}</strong></div>
                <div><span>조치 일자</span><strong>{currentTask.date}</strong></div><div><span>조치 진행 상황</span><strong>{currentTask.status}</strong></div>
                <div><span>담당자</span><strong>{currentTask.assignee}</strong></div><div><span>조치 완료 사진</span><strong>미첨부</strong></div>
              </section>
              <div className="selected-task-info"><span>조치 내용</span><p>{currentTask.content}</p></div>
            </div>
          ) : <div className="checklist-empty">목록에서 항목을 선택해 주세요.</div>}
        </article>
      </div>

      {isCreateInspectionOpen && <InspectionCreateModal form={newInspection} onChange={(field, value) => setNewInspection((current) => ({ ...current, [field]: value }))} onClose={() => setIsCreateInspectionOpen(false)} onSubmit={createInspection} />}
    </section>
  )
}

function InspectionCreateModal({ form, onChange, onClose, onSubmit }) {
  return <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="assignment-modal checklist-create-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><header><div><span>INSPECTION CREATE</span><h3>점검 항목 추가</h3><p>점검 테이블에 새 항목을 등록합니다.</p></div><button type="button" aria-label="닫기" onClick={onClose}><CloseIcon /></button></header><form className="checklist-create-form" onSubmit={onSubmit}><label className="is-wide"><span>점검 이름</span><input value={form.text} onChange={(event) => onChange('text', event.target.value)} placeholder="예: 소방설비 점검" /></label><label><span>구역</span><input value={form.location} onChange={(event) => onChange('location', event.target.value)} placeholder="예: A동 1층 복도" /></label><label><span>점검 일자</span><input type="date" value={form.date} onChange={(event) => onChange('date', event.target.value)} /></label><footer><span>새 항목은 점검 대기 상태로 등록됩니다.</span><div><button type="button" onClick={onClose}>취소</button><button type="submit">추가</button></div></footer></form></section></div>
}

export default ChecklistPage
