import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useEffect, useMemo, useState } from 'react'
import actionPhoto1 from '../assets/actionhistory_1.jpg'
import actionPhoto3 from '../assets/actionhistory_3.jpg'
import actionPhoto5 from '../assets/actionhistory_5.jpg'
import actionPhoto7 from '../assets/actionhistory_7.jpg'
import '../styles/checklist.css'
import {
  getStoredChecklistManagementRecords,
  mergeChecklistManagementRecords,
  saveChecklistManagementRecords,
} from '../utils/checklistStatusStorage'

const CHECKLISTS = [
  { id: 1, name: '비상구·피난 통로 점검', location: 'B동 1층 현관', category: '시설 안전', assignee: '신지윤', completedBy: '이도현', date: '2026-07-09', progress: '점검 대기', assignment: '배정 완료', level: '높음', photo: true, images: [actionPhoto1, actionPhoto3], note: '현관 비상구 주변 적치물은 없으며, 유도등 작동 상태를 확인 중입니다.' },
  { id: 2, name: '소화기 및 소방설비 점검', location: 'A동 2층 복도', category: '소방 안전', assignee: '', completedBy: '김하린', date: '2026-07-11', progress: '점검 대기', assignment: '미배정', level: '보통', photo: false, images: [], note: '정기 점검 일정에 따라 소화기 위치와 압력 게이지를 확인할 예정입니다.' },
  { id: 3, name: '낙하물 방지 설비 점검', location: 'A동 5층 외벽', category: '작업 안전', assignee: '', completedBy: '정서윤', date: '2026-07-20', progress: '점검 대기', assignment: '미배정', level: '높음', photo: true, images: [actionPhoto5], note: '외벽 작업 전 난간 및 낙하물 방지망 상태를 우선 확인해야 합니다.' },
  { id: 4, name: '전기 패널 및 누전 차단기 점검', location: 'C동 지하 1층', category: '전기 안전', assignee: '임현수', completedBy: '최민석', date: '2026-07-14', progress: '점검 대기', assignment: '배정 완료', level: '낮음', photo: true, images: [actionPhoto7, actionPhoto3], note: '패널 외관, 누전 차단기 시험 버튼 및 주변 정리 상태를 모두 확인했습니다.' },
  { id: 5, name: '보호구 착용 상태 점검', location: 'B동 3층 작업장', category: '작업 안전', assignee: '김다온', completedBy: '한유진', date: '2026-07-18', progress: '점검 대기', assignment: '배정 완료', level: '보통', photo: false, images: [], note: '작업자 보호구 착용 여부를 순차적으로 점검하고 있습니다.' },
]

const MEMBERS = [
  { name: '신지윤', zone: 'B동 1층', workload: 1, available: true },
  { name: '박동준', zone: 'A동 2층', workload: 2, available: true },
  { name: '윤지석', zone: 'A동 5층', workload: 0, available: true },
  { name: '임현수', zone: 'C동 지하 1층', workload: 3, available: false },
]

const TARGETS = [
  { name: '이도현', zone: 'B동 1층', workload: 1, available: true },
  { name: '김하린', zone: 'A동 2층', workload: 2, available: true },
  { name: '정서윤', zone: 'A동 5층', workload: 1, available: true },
  { name: '최민석', zone: 'C동 지하 1층', workload: 3, available: true },
  { name: '한유진', zone: 'B동 3층', workload: 2, available: true },
]

const INITIAL_NEW_CHECKLIST = {
  name: '',
  location: '',
  category: '',
  completedBy: '',
  date: '2026-07-25',
}

function normalizeProgress(progress) {
  if (progress === '점검 중' || progress === '점검중') return '점검 대기'
  if (progress === '조치 필요' || progress === '조치 중') return '조치 대기'
  return progress
}

function getProgressDetail(progress) {
  const normalizedProgress = normalizeProgress(progress)
  const isInspectionDone = ['점검 완료', '조치 대기', '조치 완료'].includes(normalizedProgress)
  const needsAction = ['조치 대기', '조치 완료'].includes(normalizedProgress)
  const isActionDone = normalizedProgress === '조치 완료'

  return {
    isInspectionDone,
    needsAction,
    isActionDone,
    riskLabel: !isInspectionDone ? '대기' : needsAction ? '조치 필요' : '기준 이하',
  }
}

function getMonthRange(month) {
  const [year, monthNumber] = month.split('-').map(Number)
  const lastDay = new Date(year, monthNumber, 0).getDate()
  return `${year}. ${String(monthNumber).padStart(2, '0')}. 01 - ${year}. ${String(monthNumber).padStart(2, '0')}. ${lastDay}`
}

function getChecklistRiskScore(item) {
  const progress = normalizeProgress(item.progress)

  if (progress === '조치 완료') {
    return item.actionRiskScore ?? item.riskScore ?? item.inspectionRiskScore
  }

  return item.inspectionRiskScore ?? item.riskScore
}

function ChecklistManagementPage() {
  const [records, setRecords] = useState(() => mergeChecklistManagementRecords(CHECKLISTS))
  const [filters, setFilters] = useState({ location: '전체 구역', progress: '전체 상태', targetAssignment: '대상자 필터링', assignment: '담당자 필터링', query: '' })
  const [selected, setSelected] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [memberQuery, setMemberQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2026-07')
  const [newChecklist, setNewChecklist] = useState(INITIAL_NEW_CHECKLIST)
  const [page, setPage] = useState(0)

  useEffect(() => {
    const syncInspectionResults = () => {
      setRecords(mergeChecklistManagementRecords(CHECKLISTS))
    }

    window.addEventListener('focus', syncInspectionResults)
    window.addEventListener('storage', syncInspectionResults)

    return () => {
      window.removeEventListener('focus', syncInspectionResults)
      window.removeEventListener('storage', syncInspectionResults)
    }
  }, [])

  const filtered = useMemo(() => records.filter((item) => {
    const query = filters.query.trim()
    const hasAssignee = Boolean(item.assignee.trim())
    const hasTarget = Boolean(item.completedBy.trim())
    const progress = normalizeProgress(item.progress)
    return item.date.startsWith(selectedMonth)
      && (filters.location === '전체 구역' || item.location.includes(filters.location))
      && (filters.progress === '전체 상태' || progress === filters.progress)
      && (filters.targetAssignment === '대상자 필터링' || (filters.targetAssignment === '대상자 배정 완료' ? hasTarget : !hasTarget))
      && (filters.assignment === '담당자 필터링' || (filters.assignment === '담당자 배정 완료' ? hasAssignee : !hasAssignee))
      && (!query || item.name.includes(query) || item.assignee.includes(query) || item.completedBy.includes(query))
  }), [records, filters, selectedMonth])

  const pageSize = 4
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const activePage = Math.min(page, pageCount - 1)
  const visibleRecords = filtered.slice(activePage * pageSize, (activePage + 1) * pageSize)
  const visibleIds = visibleRecords.map((item) => item.id)
  const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))
  const monthRange = getMonthRange(selectedMonth)
  const metrics = [
    ['전체 체크리스트', records.length, '이번 주 등록 기준', ChecklistOutlinedIcon],
    ['조치 대기', records.filter((item) => normalizeProgress(item.progress) === '조치 대기').length, '조치 등록이 필요해요', PendingActionsOutlinedIcon],
    ['조치 완료', records.filter((item) => normalizeProgress(item.progress) === '조치 완료').length, '조치 확인까지 마쳤어요', AssignmentTurnedInOutlinedIcon],
    ['담당자 미배정', records.filter((item) => !item.assignee.trim()).length, '빠른 배정이 필요해요', PersonOffOutlinedIcon],
  ]
  const selectablePeople = selected?.mode === 'assign-target' ? TARGETS : MEMBERS
  const members = selectablePeople.filter((item) => item.name.includes(memberQuery.trim()) || item.zone.includes(memberQuery.trim()))

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(0)
    setSelectedIds([])
  }

  const reset = () => {
    setFilters({ location: '전체 구역', progress: '전체 상태', targetAssignment: '대상자 필터링', assignment: '담당자 필터링', query: '' })
    setPage(0)
    setSelectedIds([])
  }

  const toggleRow = (id) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    ))
  }

  const toggleVisibleRows = () => {
    setSelectedIds((current) => {
      if (isAllVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }

      return [...new Set([...current, ...visibleIds])]
    })
  }

  const openBulkAssign = (mode) => {
    if (selectedIds.length === 0) return
    setSelected({ mode, ids: selectedIds })
    setMemberQuery('')
  }

  const assign = (member) => {
    if (selected.mode === 'assign-target') {
      setRecords((current) => {
        const nextRecords = current.map((item) => (
          selected.ids.includes(item.id) ? { ...item, completedBy: member.name } : item
        ))
        saveChecklistManagementRecords(nextRecords)
        return nextRecords
      })
    } else {
      setRecords((current) => {
        const nextRecords = current.map((item) => (
          selected.ids.includes(item.id) ? { ...item, assignee: member.name, assignment: '배정 완료' } : item
        ))
        saveChecklistManagementRecords(nextRecords)
        return nextRecords
      })
    }

    setSelectedIds([])
    setSelected(null)
  }

  const openCreateChecklist = () => {
    setNewChecklist((current) => ({
      ...INITIAL_NEW_CHECKLIST,
      date: selectedMonth ? `${selectedMonth}-25` : current.date,
    }))
    setSelected({ mode: 'create' })
  }

  const updateNewChecklist = (field, value) => {
    setNewChecklist((current) => ({ ...current, [field]: value }))
  }

  const createChecklist = (event) => {
    event.preventDefault()

    if (!newChecklist.name.trim() || !newChecklist.location.trim() || !newChecklist.category.trim() || !newChecklist.completedBy.trim()) {
      alert('체크리스트명, 구역/위치, 분류, 대상자를 입력해 주세요.')
      return
    }

    const created = {
      id: `management-${Date.now()}`,
      name: newChecklist.name.trim(),
      location: newChecklist.location.trim(),
      category: newChecklist.category.trim(),
      assignee: '',
      completedBy: newChecklist.completedBy.trim(),
      date: newChecklist.date,
      progress: '점검 대기',
      assignment: '미배정',
      level: '보통',
      photo: false,
      images: [],
      note: '등록된 점검 항목입니다.',
    }

    setRecords((current) => {
      const nextRecords = [created, ...current]
      saveChecklistManagementRecords([created, ...getStoredChecklistManagementRecords()])
      return nextRecords
    })
    setSelectedMonth(created.date.slice(0, 7))
    setSelectedIds([])
    setPage(0)
    setSelected(null)
  }

  return (
    <section className="checklist-management-page">
      <div className="checklist-metrics">
        {metrics.map(([label, value, note, Icon], index) => (
          <article className={`checklist-metric metric-${index}`} key={label}>
            <span className="metric-heading"><i><Icon /></i>{label}</span>
            <strong>{value}<small>건</small></strong>
            <p>{note}</p>
          </article>
        ))}
      </div>

      <article className="management-table-card">
        <div className="management-table-header">
          <div>
            <span className="section-kicker"><FilterAltOutlinedIcon /> CHECKLIST OVERVIEW</span>
            <h3>전체 체크리스트</h3>
          </div>
          <div className="management-header-actions">
            <button className="checklist-create-button" type="button" onClick={openCreateChecklist}>
              <AddRoundedIcon /> 항목 추가
            </button>
            <label className="management-date">
              <CalendarTodayOutlinedIcon />
              <input type="month" value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setPage(0); setSelectedIds([]) }} />
              <span>{monthRange}</span>
            </label>
          </div>
        </div>

        <div className="management-filters">
          <FilterSelect value={filters.location} options={['전체 구역', 'A동', 'B동', 'C동']} onChange={(value) => updateFilter('location', value)} />
          <FilterSelect value={filters.progress} options={['전체 상태', '점검 대기', '점검 완료', '조치 대기', '조치 완료']} onChange={(value) => updateFilter('progress', value)} />
          <FilterSelect value={filters.targetAssignment} options={['대상자 배정 완료', '대상자 미배정']} onChange={(value) => updateFilter('targetAssignment', value)} />
          <FilterSelect value={filters.assignment} options={['담당자 배정 완료', '담당자 미배정']} onChange={(value) => updateFilter('assignment', value)} />
          <label className="management-search">
            <SearchRoundedIcon />
            <input value={filters.query} onChange={(event) => updateFilter('query', event.target.value)} placeholder="체크리스트명 또는 담당자 검색" />
          </label>
          <button className="filter-reset" type="button" onClick={reset}><RestartAltRoundedIcon />초기화</button>
        </div>

        <div className="bulk-assign-toolbar">
          <span>선택 <strong>{selectedIds.length}</strong>건</span>
          <div>
            <button type="button" disabled={selectedIds.length === 0} onClick={() => openBulkAssign('assign-target')}>
              <PersonOutlineRoundedIcon /> 대상자 배정
            </button>
            <button type="button" disabled={selectedIds.length === 0} onClick={() => openBulkAssign('assign')}>
              <AssignmentIndOutlinedIcon /> 담당자 배정
            </button>
          </div>
        </div>

        <div className="checklist-table-wrap">
          <table className="checklist-management-table">
            <thead>
              <tr>
                <th className="checklist-select-col">
                  <input type="checkbox" checked={isAllVisibleSelected} onChange={toggleVisibleRows} aria-label="현재 페이지 체크리스트 전체 선택" />
                </th>
                <th>체크리스트명</th>
                <th>구역/위치</th>
                <th>대상자</th>
                <th>일시</th>
                <th>위험도</th>
                <th>진행 상태</th>
                <th>담당자</th>
                <th>증빙</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((item) => (
                <tr className="checklist-detail-row" key={item.id} onClick={() => setSelected({ ...item, mode: 'detail' })}>
                  <td className="checklist-select-col" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleRow(item.id)} aria-label={`${item.name} 선택`} />
                  </td>
                  <td><strong>{item.name}</strong><span className="table-category">{item.category}</span></td>
                  <td><span className="location-cell"><LocationOnOutlinedIcon />{item.location}</span></td>
                  <td><span className="assignee-cell performer-cell"><i>{item.completedBy.slice(0, 1)}</i>{item.completedBy}</span></td>
                  <td>{item.date}</td>
                  <td><RiskScoreCell value={getChecklistRiskScore(item)} /></td>
                  <td><StatusBadge value={normalizeProgress(item.progress)} /></td>
                  <td>{item.assignee ? <span className="assignee-cell"><i>{item.assignee.slice(0, 1)}</i>{item.assignee}</span> : <span className="no-photo">미배정</span>}</td>
                  <td>{item.photo ? <span className="photo-chip"><ImageOutlinedIcon />첨부</span> : <span className="no-photo">-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="checklist-empty">조건에 맞는 체크리스트가 없습니다.</div>}
        </div>

        <footer className="checklist-pagination">
          <span>총 <strong>{filtered.length}</strong>건</span>
          <div>
            <button type="button" aria-label="이전 페이지" disabled={activePage === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftRoundedIcon /></button>
            <b>{activePage + 1} / {pageCount}</b>
            <button type="button" aria-label="다음 페이지" disabled={activePage === pageCount - 1} onClick={() => setPage((current) => current + 1)}><ChevronRightRoundedIcon /></button>
          </div>
        </footer>
      </article>

      {(selected?.mode === 'assign' || selected?.mode === 'assign-target') && (
        <AssignmentModal
          checklistCount={selected.ids.length}
          members={members}
          mode={selected.mode}
          query={memberQuery}
          onQueryChange={setMemberQuery}
          onClose={() => setSelected(null)}
          onAssign={assign}
        />
      )}
      {selected?.mode === 'create' && (
        <ChecklistCreateModal
          form={newChecklist}
          onChange={updateNewChecklist}
          onClose={() => setSelected(null)}
          onSubmit={createChecklist}
        />
      )}
      {selected?.mode === 'detail' && <ChecklistDetailModal checklist={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}

function FilterSelect({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`management-filter-select${isOpen ? ' is-open' : ''}`}>
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
        <span>{value}</span>
        <KeyboardArrowDownRoundedIcon />
      </button>
      {isOpen && (
        <div className="management-select-menu">
          {options.map((option) => (
            <button className={option === value ? 'is-selected' : ''} type="button" key={option} onClick={() => { onChange(option); setIsOpen(false) }}>
              {option}
              {option === value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ value }) {
  const state = value === '점검 완료' || value === '조치 완료' || value === '배정 완료' ? 'is-complete' : value === '미배정' ? 'is-unassigned' : value === '조치 대기' ? 'is-progress' : 'is-pending'
  return <span className={`checklist-status ${state}`}>{value}</span>
}

function RiskScoreCell({ value }) {
  return Number.isFinite(Number(value))
    ? <span className="risk-score-cell">{value}점</span>
    : <span className="no-photo">-</span>
}

function ChecklistCreateModal({ form, onChange, onClose, onSubmit }) {
  return (
    <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="assignment-modal checklist-create-modal" role="dialog" aria-modal="true" aria-labelledby="checklist-create-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>CHECKLIST CREATE</span>
            <h3 id="checklist-create-title">체크리스트 항목 추가</h3>
            <p>전체 체크리스트에 새 점검 항목을 등록합니다.</p>
          </div>
          <button type="button" aria-label="체크리스트 항목 추가 창 닫기" onClick={onClose}><CloseRoundedIcon /></button>
        </header>

        <form className="checklist-create-form" onSubmit={onSubmit}>
          <label>
            <span>체크리스트명</span>
            <input value={form.name} onChange={(event) => onChange('name', event.target.value)} placeholder="예: 비상구 피난 통로 점검" />
          </label>
          <label>
            <span>구역/위치</span>
            <input value={form.location} onChange={(event) => onChange('location', event.target.value)} placeholder="예: A동 2층 복도" />
          </label>
          <label>
            <span>분류</span>
            <input value={form.category} onChange={(event) => onChange('category', event.target.value)} placeholder="예: 소방 안전" />
          </label>
          <label>
            <span>대상자</span>
            <input value={form.completedBy} onChange={(event) => onChange('completedBy', event.target.value)} placeholder="예: 김하린" />
          </label>
          <label>
            <span>점검일</span>
            <input type="date" value={form.date} onChange={(event) => onChange('date', event.target.value)} />
          </label>
          <footer>
            <span>새 항목은 진행 상태가 점검 대기로 등록됩니다.</span>
            <div>
              <button type="button" onClick={onClose}>취소</button>
              <button type="submit">추가</button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}

function AssignmentModal({ checklistCount, members, mode, query, onQueryChange, onClose, onAssign }) {
  const isTarget = mode === 'assign-target'
  const title = isTarget ? '대상자 배정' : '담당자 배정'

  return (
    <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>{isTarget ? 'CHECKLIST TARGET' : 'CHECKLIST ASSIGNMENT'}</span>
            <h3 id="assignment-title">{title}</h3>
            <p>선택한 {checklistCount}개 점검 항목에 배정할 사람을 선택해 주세요.</p>
          </div>
          <button type="button" aria-label={`${title} 창 닫기`} onClick={onClose}><CloseRoundedIcon /></button>
        </header>

        <div className="assignment-checklist-summary">
          <div className="summary-icon"><WarningAmberRoundedIcon /></div>
          <div>
            <span>선택 항목</span>
            <strong>{checklistCount}개 체크리스트</strong>
            <p>{isTarget ? '점검 수행 대상자를 일괄 배정합니다.' : '현장 담당자를 일괄 배정합니다.'}</p>
          </div>
        </div>

        <div className="assignment-member-section">
          <div className="assignment-section-heading">
            <div>
              <span>{isTarget ? 'TARGET LIST' : 'MANAGER LIST'}</span>
              <h4>{title}</h4>
            </div>
            <label>
              <SearchRoundedIcon />
              <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="이름 또는 담당 구역 검색" />
            </label>
          </div>
          <div className="assignment-member-list">
            {members.map((member) => (
              <button type="button" className={`assignment-member${!member.available ? ' is-unavailable' : ''}`} key={member.name} disabled={!member.available} onClick={() => onAssign(member)}>
                <span className="member-avatar">{member.name.slice(0, 1)}</span>
                <span className="member-copy"><strong>{member.name}</strong><small>{member.zone} 담당 · 현재 업무 {member.workload}건</small></span>
                <span className={`member-availability${member.available ? ' is-available' : ''}`}>{member.available ? '배정 가능' : '업무 집중'}</span>
                <PersonOutlineRoundedIcon className="member-arrow" />
              </button>
            ))}
            {!members.length && <p className="member-empty">검색 결과가 없습니다.</p>}
          </div>
        </div>

        <footer>
          <span>{title} 시 선택한 체크리스트에 즉시 반영됩니다.</span>
          <button type="button" onClick={onClose}>닫기</button>
        </footer>
      </section>
    </div>
  )
}

function ChecklistDetailModal({ checklist, onClose }) {
  const [activeImage, setActiveImage] = useState(checklist.images[0] ?? null)
  const progressDetail = getProgressDetail(checklist.progress)

  return (
    <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="checklist-detail-modal" role="dialog" aria-modal="true" aria-labelledby="checklist-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>CHECKLIST DETAIL</span>
            <h3 id="checklist-detail-title">점검 진행 상세</h3>
            <p>{checklist.category} · {checklist.date}</p>
          </div>
          <button type="button" aria-label="점검 상세 창 닫기" onClick={onClose}><CloseRoundedIcon /></button>
        </header>
        <div className="detail-title-row">
          <div>
            <span>점검 항목</span>
            <strong>{checklist.name}</strong>
            <p><LocationOnOutlinedIcon />{checklist.location} · 대상자 {checklist.completedBy} · 담당 {checklist.assignee || '미배정'}</p>
          </div>
          <StatusBadge value={normalizeProgress(checklist.progress)} />
        </div>
        <div className="detail-content-grid">
          <section className="detail-note-card">
            <span>현장 확인 내용</span>
            <p>{checklist.note}</p>
            <div className="detail-steps">
              <div><i>1</i><span>점검 수행</span><b className={progressDetail.isInspectionDone ? '' : 'is-waiting'}>{progressDetail.isInspectionDone ? '완료' : '대기'}</b></div>
              <div><i>2</i><span>위험도 기준 판정</span><b className={progressDetail.needsAction ? 'is-active' : ''}>{progressDetail.riskLabel}</b></div>
              <div><i>3</i><span>조치 사진 및 결과 등록</span><b className={progressDetail.isActionDone ? '' : 'is-waiting'}>{progressDetail.isActionDone ? '완료' : '대기'}</b></div>
            </div>
          </section>
          <section className="detail-photo-card">
            <div><span>증빙 사진</span><small>{checklist.images.length}장 첨부</small></div>
            {activeImage ? (
              <img className="detail-main-photo" src={activeImage} alt={`${checklist.name} 증빙 사진`} />
            ) : (
              <div className="detail-no-photo"><ImageOutlinedIcon /><strong>등록된 증빙 사진이 없습니다.</strong><span>점검 완료 후 현장 사진을 등록할 수 있습니다.</span></div>
            )}
            {checklist.images.length > 1 && (
              <div className="detail-thumbnails">
                {checklist.images.map((image, index) => (
                  <button className={image === activeImage ? 'is-active' : ''} type="button" key={image} onClick={() => setActiveImage(image)}>
                    <img src={image} alt={`증빙 사진 ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
        <footer><span>최종 업데이트 · {checklist.date} 14:20</span><button type="button" onClick={onClose}>닫기</button></footer>
      </section>
    </div>
  )
}

export default ChecklistManagementPage
