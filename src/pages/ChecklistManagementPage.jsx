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
import { useMemo, useState } from 'react'
import actionPhoto1 from '../assets/actionhistory_1.jpg'
import actionPhoto3 from '../assets/actionhistory_3.jpg'
import actionPhoto5 from '../assets/actionhistory_5.jpg'
import actionPhoto7 from '../assets/actionhistory_7.jpg'
import '../styles/checklist.css'

const CHECKLISTS = [
  { id: 1, name: '비상구·피난 통로 점검', location: 'B동 1층 현관', category: '시설 안전', assignee: '신지윤', completedBy: '이도현', date: '2026-07-09', progress: '점검 중', assignment: '배정 완료', level: '높음', photo: true, images: [actionPhoto1, actionPhoto3], note: '현관 비상구 주변 적치물은 없으며, 유도등 작동 상태를 확인 중입니다.' },
  { id: 2, name: '소화기 및 소방설비 점검', location: 'A동 2층 복도', category: '소방 안전', assignee: '박동준', completedBy: '김하린', date: '2026-07-11', progress: '점검 대기', assignment: '미배정', level: '보통', photo: false, images: [], note: '정기 점검 일정에 따라 소화기 위치와 압력 게이지를 확인할 예정입니다.' },
  { id: 3, name: '낙하물 방지 설비 점검', location: 'A동 5층 외벽', category: '작업 안전', assignee: '윤지석', completedBy: '정서윤', date: '2026-07-20', progress: '점검 대기', assignment: '미배정', level: '높음', photo: true, images: [actionPhoto5], note: '외벽 작업 전 난간 및 낙하물 방지망 상태를 우선 확인해야 합니다.' },
  { id: 4, name: '전기 패널 및 누전 차단기 점검', location: 'C동 지하 1층', category: '전기 안전', assignee: '임현수', completedBy: '최민석', date: '2026-07-14', progress: '점검 완료', assignment: '배정 완료', level: '낮음', photo: true, images: [actionPhoto7, actionPhoto3], note: '패널 외관, 누전 차단기 시험 버튼 및 주변 정리 상태를 모두 확인했습니다.' },
  { id: 5, name: '보호구 착용 상태 점검', location: 'B동 3층 작업장', category: '작업 안전', assignee: '김다온', completedBy: '한유진', date: '2026-07-18', progress: '점검 중', assignment: '배정 완료', level: '보통', photo: false, images: [], note: '작업자 보호구 착용 여부를 순차적으로 점검하고 있습니다.' },
]
const MEMBERS = [
  { name: '신지윤', zone: 'B동 1층', workload: 1, available: true }, { name: '박동준', zone: 'A동 2층', workload: 2, available: true }, { name: '윤지석', zone: 'A동 5층', workload: 0, available: true }, { name: '임현수', zone: 'C동 지하 1층', workload: 3, available: false },
]

function getMonthRange(month) {
  const [year, monthNumber] = month.split('-').map(Number)
  const lastDay = new Date(year, monthNumber, 0).getDate()
  return `${year}. ${String(monthNumber).padStart(2, '0')}. 01 - ${year}. ${String(monthNumber).padStart(2, '0')}. ${lastDay}`
}

function ChecklistManagementPage() {
  const [records, setRecords] = useState(CHECKLISTS)
  const [filters, setFilters] = useState({ location: '전체 구역', progress: '전체 상태', assignment: '전체 배정', query: '' })
  const [selected, setSelected] = useState(null)
  const [memberQuery, setMemberQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2026-07')
  const [page, setPage] = useState(0)
  const filtered = useMemo(() => records.filter((item) => {
    const query = filters.query.trim()
    return item.date.startsWith(selectedMonth) && (filters.location === '전체 구역' || item.location.includes(filters.location)) && (filters.progress === '전체 상태' || item.progress === filters.progress) && (filters.assignment === '전체 배정' || item.assignment === filters.assignment) && (!query || item.name.includes(query) || item.assignee.includes(query) || item.completedBy.includes(query))
  }), [records, filters, selectedMonth])
  const pageSize = 4
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const activePage = Math.min(page, pageCount - 1)
  const visibleRecords = filtered.slice(activePage * pageSize, (activePage + 1) * pageSize)
  const monthRange = getMonthRange(selectedMonth)
  const metrics = [['전체 체크리스트', records.length, '이번 주 등록 기준', ChecklistOutlinedIcon], ['점검 중', records.filter((item) => item.progress === '점검 중').length, '현장 확인 진행 중', PendingActionsOutlinedIcon], ['완료', records.filter((item) => item.progress === '점검 완료').length, '조치 확인까지 마쳤어요', AssignmentTurnedInOutlinedIcon], ['담당자 미배정', records.filter((item) => item.assignment === '미배정').length, '빠른 배정이 필요해요', PersonOffOutlinedIcon]]
  const members = MEMBERS.filter((item) => item.name.includes(memberQuery.trim()) || item.zone.includes(memberQuery.trim()))
  const updateFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0) }
  const reset = () => { setFilters({ location: '전체 구역', progress: '전체 상태', assignment: '전체 배정', query: '' }); setPage(0) }
  const assign = (member) => { setRecords((current) => current.map((item) => item.id === selected.id ? { ...item, assignee: member.name, assignment: '배정 완료' } : item)); setSelected(null) }

  return <section className="checklist-management-page">
    <div className="checklist-metrics">{metrics.map(([label, value, note, Icon], index) => <article className={`checklist-metric metric-${index}`} key={label}><span className="metric-heading"><i><Icon /></i>{label}</span><strong>{value}<small>건</small></strong><p>{note}</p></article>)}</div>
    <article className="management-table-card"><div className="management-table-header"><div><span className="section-kicker"><FilterAltOutlinedIcon /> CHECKLIST OVERVIEW</span><h3>전체 체크리스트</h3></div><label className="management-date"><CalendarTodayOutlinedIcon /><input type="month" value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setPage(0) }} /><span>{monthRange}</span></label></div><div className="management-filters"><FilterSelect value={filters.location} options={['전체 구역', 'A동', 'B동', 'C동']} onChange={(value) => updateFilter('location', value)} /><FilterSelect value={filters.progress} options={['전체 상태', '점검 대기', '점검 중', '점검 완료']} onChange={(value) => updateFilter('progress', value)} /><FilterSelect value={filters.assignment} options={['전체 배정', '배정 완료', '미배정']} onChange={(value) => updateFilter('assignment', value)} /><label className="management-search"><SearchRoundedIcon /><input value={filters.query} onChange={(event) => updateFilter('query', event.target.value)} placeholder="체크리스트명 또는 담당자 검색" /></label><button className="filter-reset" type="button" onClick={reset}><RestartAltRoundedIcon />초기화</button></div><div className="checklist-table-wrap"><table className="checklist-management-table"><thead><tr><th>체크리스트명</th><th>구역/위치</th><th>대상자</th><th>일시</th><th>진행 상태</th><th>배정 상태</th><th>담당자</th><th>증빙</th><th>작업</th></tr></thead><tbody>{visibleRecords.map((item) => <tr className="checklist-detail-row" key={item.id} onClick={() => setSelected({ ...item, mode: 'detail' })}><td><strong>{item.name}</strong><span className="table-category">{item.category}</span></td><td><span className="location-cell"><LocationOnOutlinedIcon />{item.location}</span></td><td><span className="assignee-cell performer-cell"><i>{item.completedBy.slice(0, 1)}</i>{item.completedBy}</span></td><td>{item.date}</td><td><StatusBadge value={item.progress} /></td><td><StatusBadge value={item.assignment} /></td><td><span className="assignee-cell"><i>{item.assignee.slice(0, 1)}</i>{item.assignee}</span></td><td>{item.photo ? <span className="photo-chip"><ImageOutlinedIcon />첨부</span> : <span className="no-photo">-</span>}</td><td>{item.assignment === '배정 완료' ? <span className="no-photo">-</span> : <button className="assign-button" type="button" onClick={(event) => { event.stopPropagation(); setSelected({ ...item, mode: 'assign' }); setMemberQuery('') }}><AssignmentIndOutlinedIcon />담당자 배정</button>}</td></tr>)}</tbody></table>{!filtered.length && <div className="checklist-empty">조건에 맞는 체크리스트가 없습니다.</div>}</div><footer className="checklist-pagination"><span>총 <strong>{filtered.length}</strong>건</span><div><button type="button" aria-label="이전 페이지" disabled={activePage === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftRoundedIcon /></button><b>{activePage + 1} / {pageCount}</b><button type="button" aria-label="다음 페이지" disabled={activePage === pageCount - 1} onClick={() => setPage((current) => current + 1)}><ChevronRightRoundedIcon /></button></div></footer></article>
    {selected?.mode === 'assign' && <AssignmentModal checklist={selected} members={members} query={memberQuery} onQueryChange={setMemberQuery} onClose={() => setSelected(null)} onAssign={assign} />}
    {selected?.mode === 'detail' && <ChecklistDetailModal checklist={selected} onClose={() => setSelected(null)} />}
  </section>
}
function FilterSelect({ value, options, onChange }) { const [isOpen, setIsOpen] = useState(false); return <div className={`management-filter-select${isOpen ? ' is-open' : ''}`}><button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}><span>{value}</span><KeyboardArrowDownRoundedIcon /></button>{isOpen && <div className="management-select-menu">{options.map((option) => <button className={option === value ? 'is-selected' : ''} type="button" key={option} onClick={() => { onChange(option); setIsOpen(false) }}>{option}{option === value && <span>✓</span>}</button>)}</div>}</div> }
function StatusBadge({ value }) { const state = value === '점검 완료' || value === '배정 완료' ? 'is-complete' : value === '미배정' ? 'is-unassigned' : value === '점검 중' ? 'is-progress' : 'is-pending'; return <span className={`checklist-status ${state}`}>{value}</span> }
function AssignmentModal({ checklist, members, query, onQueryChange, onClose, onAssign }) { return <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CHECKLIST ASSIGNMENT</span><h3 id="assignment-title">담당자 배정</h3><p>점검 내용에 적합한 현장관리자를 선택해 주세요.</p></div><button type="button" aria-label="담당자 배정 창 닫기" onClick={onClose}><CloseRoundedIcon /></button></header><div className="assignment-checklist-summary"><div className="summary-icon"><WarningAmberRoundedIcon /></div><div><span>점검 항목</span><strong>{checklist.name}</strong><p><LocationOnOutlinedIcon />{checklist.location} <b>·</b> {checklist.date}</p></div><div className={`risk-level risk-${checklist.level}`}><small>위험도</small><strong>{checklist.level}</strong></div></div><div className="assignment-member-section"><div className="assignment-section-heading"><div><span>MANAGER LIST</span><h4>담당자 선택</h4></div><label><SearchRoundedIcon /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="이름 또는 담당 구역 검색" /></label></div><div className="assignment-member-list">{members.map((member) => <button type="button" className={`assignment-member${!member.available ? ' is-unavailable' : ''}`} key={member.name} disabled={!member.available} onClick={() => onAssign(member)}><span className="member-avatar">{member.name.slice(0, 1)}</span><span className="member-copy"><strong>{member.name}</strong><small>{member.zone} 담당 · 현재 업무 {member.workload}건</small></span><span className={`member-availability${member.available ? ' is-available' : ''}`}>{member.available ? '배정 가능' : '업무 집중'}</span><PersonOutlineRoundedIcon className="member-arrow" /></button>)}{!members.length && <p className="member-empty">검색 결과가 없습니다.</p>}</div></div><footer><span>담당자 선택 시 즉시 배정되며, 현장관리자에게 알림이 전송됩니다.</span><button type="button" onClick={onClose}>닫기</button></footer></section></div> }

function ChecklistDetailModal({ checklist, onClose }) {
  const [activeImage, setActiveImage] = useState(checklist.images[0] ?? null)
  return <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="checklist-detail-modal" role="dialog" aria-modal="true" aria-labelledby="checklist-detail-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CHECKLIST DETAIL</span><h3 id="checklist-detail-title">점검 진행 상세</h3><p>{checklist.category} · {checklist.date}</p></div><button type="button" aria-label="점검 상세 창 닫기" onClick={onClose}><CloseRoundedIcon /></button></header><div className="detail-title-row"><div><span>점검 항목</span><strong>{checklist.name}</strong><p><LocationOnOutlinedIcon />{checklist.location} · 대상자 {checklist.completedBy} · 담당 {checklist.assignee}</p></div><StatusBadge value={checklist.progress} /></div><div className="detail-content-grid"><section className="detail-note-card"><span>현장 확인 내용</span><p>{checklist.note}</p><div className="detail-steps"><div><i>1</i><span>체크리스트 항목 확인</span><b>완료</b></div><div><i>2</i><span>현장 상태 및 위험요소 기록</span><b className={checklist.progress === '점검 완료' ? '' : 'is-active'}>{checklist.progress === '점검 완료' ? '완료' : '진행 중'}</b></div><div><i>3</i><span>조치 사진 및 결과 등록</span><b className={checklist.images.length ? '' : 'is-waiting'}>{checklist.images.length ? '완료' : '대기'}</b></div></div></section><section className="detail-photo-card"><div><span>증빙 사진</span><small>{checklist.images.length}장 첨부</small></div>{activeImage ? <img className="detail-main-photo" src={activeImage} alt={`${checklist.name} 증빙 사진`} /> : <div className="detail-no-photo"><ImageOutlinedIcon /><strong>등록된 증빙 사진이 없습니다.</strong><span>점검 완료 후 현장 사진을 등록할 수 있습니다.</span></div>}{checklist.images.length > 1 && <div className="detail-thumbnails">{checklist.images.map((image, index) => <button className={image === activeImage ? 'is-active' : ''} type="button" key={image} onClick={() => setActiveImage(image)}><img src={image} alt={`증빙 사진 ${index + 1}`} /></button>)}</div>}</section></div><footer><span>최종 업데이트 · {checklist.date} 14:20</span><button type="button" onClick={onClose}>닫기</button></footer></section></div>
}
export default ChecklistManagementPage
