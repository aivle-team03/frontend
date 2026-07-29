import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import '../styles/checklist.css'
import { BASE_INSPECTION_RECORDS } from './InspectionListPage'
import {
  getStoredChecklistManagementRecords,
  saveChecklistManagementRecords,
} from '../utils/checklistStatusStorage'

const CATEGORY = [ '소방안전' , '시설안전' , '산업안전' ,'기타']
const MANAGERS = ['이안전', '김안전', '박점검', '최점검']
const API_BASE_URL = 'http://127.0.0.1:8000'
const rows = [
  ['비상구 피난 통로 점검','시설 안전','A동 1층 복도','매일','이안전','','2026-07-10 09:00','점검 대기'],['소화기 및 소방설비 점검','화재 예방','A동 2층 복도','매주','김안전','최점검','2026-07-11 14:00','조치 대기'],['운반 장비 방호설비 점검','작업 안전','A동 5층 작업장','매월','','','2026-07-12 10:00','점검 대기'],['전기 분전반 및 차단기 점검','시설 안전','C동 지하 1층','매월','최점검','이안전','2026-07-13 11:00','조치 완료'],['보호구 착용 상태 점검','작업 안전','B동 3층 작업장','매일','박점검','','2026-07-14 13:00','점검 완료'],['적재물 전도 위험 점검','시설 안전','C동 창고','매주','이안전','김안전','2026-07-15 15:00','조치 대기'],['비상 조명 및 유도등 점검','화재 예방','A동 3층 계단','매월','','','2026-07-16 10:00','점검 대기'],['가스 차단 밸브 점검','시설 안전','식당 조리실','매주','최점검','김안전','2026-07-17 08:30','조치 완료'],['방화문 폐쇄 상태 점검','화재 예방','B동 2층 복도','매일','이안전','','2026-07-18 09:30','점검 대기'],['비상 방송 설비 점검','화재 예방','A동 안내실','매주','김안전','','2026-07-19 11:00','점검 대기'],['작업장 바닥 미끄럼 점검','작업 안전','B동 1층 포장실','매일','박점검','최점검','2026-07-20 16:00','조치 대기'],['산업용 배터리 보관 점검','시설 안전','C동 충전실','매월','최점검','이안전','2026-07-21 13:30','조치 완료'],['하역장 안전 난간 점검','작업 안전','A동 하역장','매월','이안전','박점검','2026-07-22 07:30','조치 완료'],['환기 설비 필터 점검','시설 안전','B동 지하 기계실','매월','','','2026-07-23 10:00','점검 대기'],['휴게실 소화 설비 점검','화재 예방','C동 휴게실','매주','김안전','박점검','2026-07-24 12:00','조치 완료'],['지게차 충전 구역 점검','작업 안전','B동 1층 충전 구역','매일','박점검','','2026-07-25 17:00','점검 대기'],
]
const getDateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const getNextDueDate = (cycle, fromDate = new Date()) => { const next = new Date(fromDate); if (cycle === '매일') next.setDate(next.getDate() + 1); else if (cycle === '매주') next.setDate(next.getDate() + 7); else next.setMonth(next.getMonth() + 1); return getDateKey(next) }
const toPendingStatus = (type) => type === 'action' ? '조치 대기' : '점검 대기'
const toCompleteStatus = (type) => type === 'action' ? '조치 완료' : '점검 완료'
const ACTION_NAME_BY_INSPECTION = {
  '소화기 및 소방설비 점검': '소화기 및 소방설비 보수 조치',
  '전기 분전반 및 차단기 점검': '전기 분전반 차단기 이상 조치',
  '적재물 전도 위험 점검': '적재물 전도 위험 해소 조치',
  '가스 차단 밸브 점검': '가스 차단 밸브 보수 조치',
  '작업장 바닥 미끄럼 점검': '작업장 바닥 미끄럼 위험 조치',
  '산업용 배터리 보관 점검': '산업용 배터리 보관 상태 개선 조치',
  '하역장 안전 난간 점검': '하역장 안전 난간 보수 조치',
  '휴게실 소화 설비 점검': '휴게실 소화 설비 보수 조치',
}
const normalizeRecord = (record) => {
  const type = record.type || (record.progress?.startsWith('조치') ? 'action' : 'inspection')
  const nextDue = record.nextDue || record.dateTime?.slice(0, 10) || getDateKey()
  const isDue = type === 'inspection' && record.progress?.endsWith('완료') && nextDue <= getDateKey()
  const actionHistory = record.actionHistory || (type === 'action' && record.progress?.endsWith('완료') ? [{ id: `action-history-${record.id}`, actionName: record.name, location: record.location, dateTime: record.dateTime, manager: record.actionAssignee || '미배정', progress: '조치 완료', approvalStatus: '승인대기', sourceType: '점검이력' }] : [])
  const inspectionHistory = record.inspectionHistory || (type === 'inspection' && record.progress?.endsWith('완료') ? [{ id: `inspection-history-${record.id}`, inspectionName: record.name, location: record.location, dateTime: record.dateTime, manager: record.inspectionAssignee || '미배정', progress: '점검 완료', movedToAction: false, content: '' }] : [])
  return { ...record, name: type === 'action' ? ACTION_NAME_BY_INSPECTION[record.name] || record.name : record.name, type, nextDue, progress: isDue ? toPendingStatus(type) : record.progress, inspectionHistory, actionHistory }
}
export const CHECKLIST_MANAGEMENT_MOCK_RECORDS = rows.map(([name,category,location,cycle,inspectionAssignee,actionAssignee,dateTime,progress], index) => {
  const isAction = progress.startsWith('조치')
  const actionName = isAction ? ACTION_NAME_BY_INSPECTION[name] || name : name
  return normalizeRecord({ id:index+1,name:actionName,category,location,cycle:isAction ? null : cycle,inspectionAssignee,actionAssignee,dateTime,progress, type:isAction ? 'action' : 'inspection', nextDue:isAction ? null : dateTime.slice(0, 10) })
})
const rangeText = (monthValue) => { const [year, month] = monthValue.split('-').map(Number); return `${year}. ${String(month).padStart(2,'0')}. 01 - ${year}. ${String(month).padStart(2,'0')}. ${new Date(year, month, 0).getDate()}` }
const getInitialRecords = () => {
  const stored = getStoredChecklistManagementRecords()
  const storedIds = new Set(stored.map((item) => String(item.id)))
  return [...stored.map((item) => normalizeRecord({ ...item, dateTime: item.dateTime?.replace('T', ' ') })), ...CHECKLIST_MANAGEMENT_MOCK_RECORDS.filter((item) => !storedIds.has(String(item.id)))]
}
const isInspectionRecord = (item) => item.type === 'inspection' || (!item.type && item.progress.startsWith('점검'))

function ChecklistManagementPage() {
  const [records, setRecords] = useState(() => getInitialRecords())
  const [filters, setFilters] = useState({ query:'', category:'분류', inspection:'점검 담당자', action:'조치 담당자', status:'진행 상태' })
  const [periodMonth, setPeriodMonth] = useState('2026-07')
  const [usePeriod, setUsePeriod] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState([])
  const [detailItem, setDetailItem] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [assignmentMode, setAssignmentMode] = useState(null)
  const [memberQuery, setMemberQuery] = useState('')
  const [managerOptions, setManagerOptions] = useState([])
  const [cctvs, setCctvs] = useState([])
  useEffect(() => { const syncRecords = () => setRecords(getInitialRecords()); window.addEventListener('focus', syncRecords); window.addEventListener('storage', syncRecords); return () => { window.removeEventListener('focus', syncRecords); window.removeEventListener('storage', syncRecords) } }, [])
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [managerResponse, cctvResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/checklists/managers`, { params: { keyword: '' } }),
          axios.get(`${API_BASE_URL}/api/cctvs`),
        ])
        setManagerOptions((managerResponse.data || []).map((manager) => ({ name: manager.name, userId: manager.user_id })))
        setCctvs(cctvResponse.data || [])
      } catch (error) {
        console.warn('체크리스트 등록 옵션을 불러오지 못했습니다.', error)
      }
    }
    loadOptions()
  }, [])
  const changeFilter = (key, value) => { setFilters((current) => ({ ...current, [key]:value })); setPage(0) }
  const filtered = useMemo(() => records.filter((item) => (!filters.query || item.name.includes(filters.query) || item.location.includes(filters.query)) && (filters.category === '분류' || item.category === filters.category) && (filters.inspection === '점검 담당자' || item.inspectionAssignee === filters.inspection) && (filters.action === '조치 담당자' || item.actionAssignee === filters.action) && (filters.status === '진행 상태' || item.progress === filters.status) && (!usePeriod || item.dateTime.startsWith(periodMonth))).sort((a, b) => new Date(b.dateTime.replace(' ', 'T')) - new Date(a.dateTime.replace(' ', 'T'))), [records, filters, periodMonth, usePeriod])
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8)); const active = Math.min(page, pageCount - 1); const visible = filtered.slice(active * 8, active * 8 + 8)
  const chosen = records.filter((item) => selected.includes(item.id)); const actionEnabled = chosen.length > 0 && chosen.every((item) => item.progress === '조치 대기')
  const stats = [['전체 체크리스트', records.length, '등록된 기준 항목', ChecklistOutlinedIcon],['점검 대기', records.filter((item) => item.progress === '점검 대기').length, '점검 진행이 필요해요', PendingActionsOutlinedIcon],['조치 대기', records.filter((item) => item.progress === '조치 대기').length, '조치 등록이 필요해요', PendingActionsOutlinedIcon],['담당자 미배정', records.filter((item) => !item.inspectionAssignee).length, '빠른 배정이 필요해요', TaskAltRoundedIcon]]
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current,id])
  const reset = () => { setFilters({ query:'', category:'분류', inspection:'점검 담당자', action:'조치 담당자', status:'진행 상태' }); setPeriodMonth('2026-07'); setUsePeriod(false); setPage(0) }
  const addItem = (item) => {
    const savedItem = {
      ...item,
      id: `custom-${Date.now()}`,
      progress: item.type === 'inspection' ? '점검 대기' : '조치 대기',
      inspectionHistory: [],
      actionHistory: [],
      dateTime: item.dateTime.replace('T', ' '),
      nextDue: item.dateTime.slice(0, 10),
    }
    setRecords((current) => { const next = [savedItem, ...current]; saveChecklistManagementRecords(next); return next })
    setIsCreateOpen(false)
    setPage(0)
  }
  const updateCycle = (id, cycle, complete = false) => {
    setRecords((current) => {
      const next = current.map((item) => {
        if (item.id !== id) return item
        if (!complete) return { ...item, cycle }
        const historyKey = item.type === 'action' ? 'actionHistory' : 'inspectionHistory'
        const completedAt = new Date()
        const history = {
          id: `${item.type}-history-${Date.now()}`,
          inspectionName: item.name,
          actionName: item.type === 'action' ? item.name : undefined,
          location: item.location,
          dateTime: `${getDateKey(completedAt)} ${String(completedAt.getHours()).padStart(2, '0')}:${String(completedAt.getMinutes()).padStart(2, '0')}`,
          manager: item.type === 'action' ? item.actionAssignee || '미배정' : item.inspectionAssignee || '미배정',
          progress: toCompleteStatus(item.type),
          movedToAction: false,
          content: '',
          sourceType: item.type === 'action' ? '점검이력' : undefined,
          approvalStatus: item.type === 'action' ? '승인대기' : undefined,
        }
        return { ...item, progress: toCompleteStatus(item.type), dateTime: history.dateTime, nextDue: getNextDueDate(item.cycle, completedAt), [historyKey]: [history, ...(item[historyKey] || [])] }
      })
      saveChecklistManagementRecords(next)
      return next
    })
    setDetailItem((current) => current?.id === id ? (complete ? null : { ...current, cycle }) : current)
  }
  const assignMember = async (member) => {
    const field = assignmentMode === 'inspection' ? 'inspectionAssignee' : 'actionAssignee'
    const targetRecords = records.filter((item) => selected.includes(item.id))
    try {
      await Promise.all(targetRecords.filter((item) => item.databaseId).map((item) => axios.patch(`${API_BASE_URL}/api/checklists/${item.databaseId}/assign`, { user_id: member.userId })))
      setRecords((current) => { const next = current.map((item) => selected.includes(item.id) ? { ...item, [field]: member.name } : item); saveChecklistManagementRecords(next); return next })
      setSelected([]); setMemberQuery(''); setAssignmentMode(null)
    } catch (error) {
      console.error('체크리스트 담당자 DB 배정 실패:', error)
      alert('담당자 배정에 실패했습니다.')
    }
  }
  const members = (managerOptions.length ? managerOptions : MANAGERS.map((name) => ({ name, userId: null }))).filter((member) => member.name.includes(memberQuery.trim()))
  return <section className="checklist-management-page">
    <div className="checklist-metrics">{stats.map(([label,value,note,Icon], index) => <article className={`checklist-metric metric-${index}`} key={label}><span className="metric-heading"><i><Icon /></i>{label}</span><strong>{value}<small>건</small></strong><p>{note}</p></article>)}</div>
    <article className="management-table-card"><div className="management-table-header"><div><span className="section-kicker">CHECKLIST OVERVIEW</span><h3>전체 체크리스트</h3><p>일시를 확인하고 점검·조치 담당자를 배정합니다.</p></div><div className="management-header-actions"><button className="checklist-create-button" type="button" onClick={() => setIsCreateOpen(true)}><AddRoundedIcon /> 조치 항목 추가</button><div className="date-filter"><button type="button" onClick={() => setIsDateOpen((open) => !open)}><CalendarTodayOutlinedIcon /><span>{rangeText(periodMonth)}</span></button>{isDateOpen && <div className="date-filter-menu"><label>조회 월<input type="month" value={periodMonth} onChange={(event) => { setPeriodMonth(event.target.value); setUsePeriod(true); setPage(0); setIsDateOpen(false) }} /></label></div>}</div></div></div>
    <div className="management-filters"><label className="management-search"><SearchRoundedIcon /><input value={filters.query} onChange={(event) => changeFilter('query', event.target.value)} placeholder="점검 이름 또는 구역 검색" /></label><Filter value={filters.category} onChange={(value) => changeFilter('category',value)} options={CATEGORY} /><Filter value={filters.inspection} onChange={(value) => changeFilter('inspection',value)} options={['점검 담당자',...MANAGERS]} /><Filter value={filters.action} onChange={(value) => changeFilter('action',value)} options={['조치 담당자',...MANAGERS]} /><Filter value={filters.status} onChange={(value) => changeFilter('status',value)} options={['진행 상태','점검 대기','점검 완료','조치 대기','조치 완료']} /><button className="filter-reset" type="button" onClick={reset}><RestartAltRoundedIcon /> 초기화</button></div>
    <div className="bulk-assign-toolbar"><span>선택 <strong>{selected.length}</strong>건</span><div><button type="button" disabled={!chosen.length} onClick={() => setAssignmentMode('inspection')}><AssignmentIndOutlinedIcon /> 점검 담당자 배정</button><button type="button" disabled={!actionEnabled} onClick={() => setAssignmentMode('action')}><AssignmentIndOutlinedIcon /> 조치 담당자 배정</button></div></div>
    <div className="checklist-table-wrap"><table className="checklist-management-table master-checklist-table"><thead><tr><th className="checklist-select-col"><input type="checkbox" checked={visible.length > 0 && visible.every((item) => selected.includes(item.id))} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current,...visible.map((item) => item.id)])] : current.filter((id) => !visible.some((item) => item.id === id)))} /></th><th>점검 이름</th><th>적용 구역</th><th>점검 담당자</th><th>조치 담당자</th><th>일시</th><th>진행 상태</th></tr></thead><tbody>{visible.map((item) => <tr className="checklist-detail-row" key={item.id} onClick={() => setDetailItem(item)}><td className="checklist-select-col"><input type="checkbox" checked={selected.includes(item.id)} onClick={(event) => event.stopPropagation()} onChange={() => toggle(item.id)} /></td><td><strong>{item.name}</strong><span className="table-category">{item.category}</span></td><td><span className="location-cell">{item.location}</span></td><td><Assignee value={item.inspectionAssignee} /></td><td><Assignee value={item.progress.startsWith('점검') ? '' : item.actionAssignee} /></td><td>{item.dateTime}</td><td><Status value={item.progress} /></td></tr>)}</tbody></table></div>
    <footer className="checklist-pagination"><span>총 <strong>{filtered.length}</strong>건</span><div><button type="button" disabled={active === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftRoundedIcon /></button><b>{active + 1} / {pageCount}</b><button type="button" disabled={active === pageCount - 1} onClick={() => setPage((current) => current + 1)}><ChevronRightRoundedIcon /></button></div></footer></article>{detailItem && <ChecklistDetailModal item={detailItem} onCycleChange={updateCycle} onClose={() => setDetailItem(null)} />}{isCreateOpen && <CreateModal records={records} cctvs={cctvs} onClose={() => setIsCreateOpen(false)} onCreate={addItem} />}{assignmentMode && <AssignmentModal mode={assignmentMode} count={selected.length} members={members} query={memberQuery} onQueryChange={setMemberQuery} onAssign={assignMember} onClose={() => { setMemberQuery(''); setAssignmentMode(null) }} />}</section>
}
function Filter({ value, options, onChange }) { const [isOpen, setIsOpen] = useState(false); return <div className={`management-filter-select${isOpen ? ' is-open' : ''}`}><button type="button" onClick={() => setIsOpen((open) => !open)}><span>{value}</span><ExpandMoreRoundedIcon /></button>{isOpen && <div className="management-select-menu">{options.map((option) => <button type="button" className={option === value ? 'is-selected' : ''} key={option} onClick={() => { onChange(option); setIsOpen(false) }}>{option}{option === value && <span>✓</span>}</button>)}</div>}</div> }
function Assignee({ value }) { if (!value) return <span className="no-photo">미배정</span>; if (value === '게시판') return <span className="assignee-cell is-board-source"><i>게시판</i></span>; return <span className="assignee-cell"><i>{value[0]}</i>{value}</span> }
function Status({ value }) { return <span className={`checklist-status ${value.endsWith('완료') ? 'is-complete' : value === '조치 대기' ? 'is-pending' : 'is-progress'}`}>{value}</span> }
function ChecklistDetailModal({ item, onCycleChange, onClose }) {
  const locations = item.location.split(',').map((location) => location.trim()).filter(Boolean)
  const isInspection = isInspectionRecord(item)
  const inspectionDetail = BASE_INSPECTION_RECORDS.find((record) => String(record.id) === String(item.inspectionId ?? item.inspectionCatalogId ?? item.id) || record.name === item.name)
  const inspectionCycle = inspectionDetail?.cycle || ''
  const inspectionContent = inspectionDetail?.content || ''
  const inspectionHistory = [{ date:item.dateTime, location:item.location, manager:item.inspectionAssignee || '미배정', status:'점검 완료' },{ date:'2026-07-24 09:10', location:item.location, manager:item.inspectionAssignee || '미배정', status:'점검 완료' }]
  const actionHistory = item.progress.startsWith('조치') ? [{ date:item.dateTime, manager:item.actionAssignee || '미배정', status:item.progress }] : []

  return <div className="assignment-modal-backdrop" onMouseDown={onClose}><section className="checklist-detail-modal master-detail-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CHECKLIST DETAIL</span><h3>{item.name}</h3><p>{isInspection ? `${item.category} · ${item.cycle} 점검` : `${item.category} · 조치 항목`}</p></div><button type="button" aria-label="닫기" onClick={onClose}>×</button></header><div className="master-detail-body"><section className="master-summary-grid"><div><span>점검 주기</span><strong>{inspectionCycle}</strong></div><div><span>일시</span><strong>{item.dateTime}</strong></div><div><span>점검 담당자</span><strong>{item.inspectionAssignee || '미배정'}</strong></div><div><span>진행 상태</span><Status value={item.progress} /></div></section><section className="master-info-grid"><div className="is-wide"><span>내용</span><p>{inspectionContent}</p></div></section><section><div className="master-section-heading"><h4>적용 구역</h4><span>{locations.length}곳</span></div><div className="master-location-list">{locations.map((location) => <span key={location}>{location}</span>)}</div></section><section><div className="master-section-heading"><h4>점검 이력</h4><span>최근 {inspectionHistory.length}건</span></div><div className="master-history-list">{inspectionHistory.map((entry, index) => <div key={`${entry.date}-${index}`}><span>{entry.date}</span><strong>{entry.location}</strong><span>{entry.manager}</span><Status value={entry.status} /></div>)}</div></section><section><div className="master-section-heading"><h4>조치 이력</h4><span>{actionHistory.length}건</span></div>{actionHistory.length ? <div className="master-history-list">{actionHistory.map((entry) => <div key={entry.date}><span>{entry.date}</span><strong>{entry.manager}</strong><span>조치 담당자</span><Status value={entry.status} /></div>)}</div> : <div className="checklist-empty">등록된 조치 이력이 없습니다.</div>}</section></div><footer><span>점검 및 조치 진행 내역을 확인합니다.</span><button type="button" onClick={onClose}>닫기</button></footer></section></div>
}
function AssignmentModal({ mode, count, members, query, onQueryChange, onAssign, onClose }) { const title = mode === 'inspection' ? '점검 담당자 배정' : '조치 담당자 배정'; return <div className="assignment-modal-backdrop" onMouseDown={onClose}><section className="assignment-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ASSIGNMENT</span><h3>{title}</h3><p>선택한 {count}개 항목에 담당자를 일괄 배정합니다.</p></div><button type="button" aria-label="닫기" onClick={onClose}>×</button></header><div className="assignment-member-section"><div className="assignment-section-heading"><div><span>MANAGER LIST</span><h4>담당자 선택</h4></div><label><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="이름 검색" /></label></div><div className="assignment-member-list">{members.map((member) => <button type="button" className="assignment-member" key={member.userId ?? member.name} onClick={() => onAssign(member)}><span className="member-avatar">{member.name[0]}</span><span className="member-copy"><strong>{member.name}</strong><small>현장 담당자</small></span><span className="member-availability is-available">배정</span></button>)}{!members.length && <p className="member-empty">검색 결과가 없습니다.</p>}</div></div><footer><span>담당자를 선택하면 즉시 배정됩니다.</span><button type="button" onClick={onClose}>닫기</button></footer></section></div> }
function CreateModal({ onClose, onCreate }) {
  const inspectionOptions = BASE_INSPECTION_RECORDS
  const [form, setForm] = useState({ inspectionId: '', name: '', location: '', category: '', cycle: '매일', dateTime: '2026-07-29T09:00' })
  const selectedInspection = inspectionOptions.find((item) => String(item.id) === form.inspectionId)
  const areaOptions = selectedInspection?.areas || [selectedInspection?.location].filter(Boolean)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const selectInspection = (id) => {
    const selected = inspectionOptions.find((item) => String(item.id) === id)
    setForm((current) => ({
      ...current,
      inspectionId: id,
      name: selected?.name || '',
      category: selected?.category || '',
      location: '',
    }))
  }
  const submit = (event) => { event.preventDefault(); if (form.name.trim() && form.location.trim()) onCreate({ ...form, type: 'action', name: form.name.trim(), location: form.location.trim(), inspectionAssignee: '', actionAssignee: '' }) }
  return <div className="assignment-modal-backdrop" onMouseDown={onClose}><section className="assignment-modal checklist-create-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ITEM CREATE</span><h3>조치 항목 추가</h3><p>전체 체크리스트에 새 항목을 등록합니다.</p></div><button type="button" onClick={onClose}>×</button></header><form className="checklist-create-form" onSubmit={submit}><label className="is-wide"><span>조치 이름</span><select value={form.inspectionId} onChange={(event) => selectInspection(event.target.value)} required><option value="">점검 목록 선택</option>{inspectionOptions.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label><label><span>분류</span><input value={form.category} readOnly /></label><label className="is-wide"><span>적용 구역</span><select value={form.location} onChange={(event) => update('location', event.target.value)} disabled={!areaOptions.length} required><option value="">구역 선택</option>{areaOptions.map((area) => <option key={area} value={area}>{area}</option>)}</select></label><label className="is-wide"><span>내용</span><textarea value={selectedInspection?.content || ''} readOnly /></label><footer><span>조치 대기 상태로 등록됩니다.</span><div><button type="button" onClick={onClose}>취소</button><button type="submit">등록</button></div></footer></form></section></div>
}
export default ChecklistManagementPage
