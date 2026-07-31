import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import '../styles/checklist.css'
import { BASE_INSPECTION_RECORDS } from './InspectionListPage'
import {
  getStoredChecklistManagementRecords,
  saveChecklistManagementRecords,
} from '../utils/checklistStatusStorage' 

const CATEGORY = [ '소방안전' , '시설안전' , '산업안전' ,'기타']
const CATEGORY_ID_BY_NAME = {
  소방안전: 1,
  시설안전: 2,
  산업안전: 3,
  기타: 4,
}
const MANAGERS = ['이안전', '김안전', '박점검', '최점검']
const API_BASE_URL = 'http://127.0.0.1:8000'
const rows = [
  ['비상구 피난 통로 점검','시설 안전','A동 1층 복도','매일','이안전','','2026-07-10 09:00','점검 대기'],['소화기 및 소방설비 점검','화재 예방','A동 2층 복도','매주','김안전','최점검','2026-07-11 14:00','조치 대기'],['운반 장비 방호설비 점검','작업 안전','A동 5층 작업장','매월','','','2026-07-12 10:00','점검 대기'],['전기 분전반 및 차단기 점검','시설 안전','C동 지하 1층','매월','최점검','이안전','2026-07-13 11:00','조치 완료'],['보호구 착용 상태 점검','작업 안전','B동 3층 작업장','매일','박점검','','2026-07-14 13:00','점검 완료'],['적재물 전도 위험 점검','시설 안전','C동 창고','매주','이안전','김안전','2026-07-15 15:00','조치 대기'],['비상 조명 및 유도등 점검','화재 예방','A동 3층 계단','매월','','','2026-07-16 10:00','점검 대기'],['가스 차단 밸브 점검','시설 안전','식당 조리실','매주','최점검','김안전','2026-07-17 08:30','조치 완료'],['방화문 폐쇄 상태 점검','화재 예방','B동 2층 복도','매일','이안전','','2026-07-18 09:30','점검 대기'],['비상 방송 설비 점검','화재 예방','A동 안내실','매주','김안전','','2026-07-19 11:00','점검 대기'],['작업장 바닥 미끄럼 점검','작업 안전','B동 1층 포장실','매일','박점검','최점검','2026-07-20 16:00','조치 대기'],['산업용 배터리 보관 점검','시설 안전','C동 충전실','매월','최점검','이안전','2026-07-21 13:30','조치 완료'],['하역장 안전 난간 점검','작업 안전','A동 하역장','매월','이안전','박점검','2026-07-22 07:30','조치 완료'],['환기 설비 필터 점검','시설 안전','B동 지하 기계실','매월','','','2026-07-23 10:00','점검 대기'],['휴게실 소화 설비 점검','화재 예방','C동 휴게실','매주','김안전','박점검','2026-07-24 12:00','조치 완료'],['지게차 충전 구역 점검','작업 안전','B동 1층 충전 구역','매일','박점검','','2026-07-25 17:00','점검 대기'],
]
const getDateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const addDays = (date, days) => { const next = new Date(date); next.setDate(next.getDate() + days); return next }
const getInspectionDueDate = (item) => {
  if (item.type !== 'inspection') return item.dateTime

  const originalDate = item.nextDue || item.dateTime
  const [datePart, timePart = '09:00'] = String(originalDate || '').replace('T', ' ').split(' ')
  const dueDate = new Date(datePart)
  const today = new Date(getDateKey())

  if (Number.isNaN(dueDate.getTime())) return item.dateTime

  while (dueDate < today) {
    if (item.cycle === '매일' || item.cycle?.includes('일')) dueDate.setDate(dueDate.getDate() + 1)
    else if (item.cycle === '매주' || item.cycle?.includes('주')) dueDate.setDate(dueDate.getDate() + 7)
    else dueDate.setMonth(dueDate.getMonth() + 1)
  }

  return `${getDateKey(dueDate)} ${timePart}`
}
const matchesDateOffset = (dateTime, offset) => offset === 'all' || dateTime?.slice(0, 10) === getDateKey(addDays(new Date(), offset))
const DATE_FILTER_OPTIONS = [
  { key: 'all', label: '전체', value: 'all' },
  { key: 'today', label: '오늘', value: 0 },
  { key: 'tomorrow', label: '내일', value: 1 },
  { key: 'plus-2', label: '+2일', value: 2 },
]
const STATUS_FILTER_OPTIONS = {
  inspection: ['진행 상태', '점검 대기', '점검 완료'],
  action: ['진행 상태', '조치 대기'],
}
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
const getRecordType = (record) => {
  if (record.progress?.startsWith('조치')) return 'action'
  if (record.progress?.startsWith('점검')) return 'inspection'
  return record.type || 'inspection'
}
const normalizeRecord = (record) => {
  const type = getRecordType(record)
  const nextDue = record.nextDue || record.dateTime?.slice(0, 10) || getDateKey()
  const isDue = type === 'inspection' && record.progress?.endsWith('완료') && nextDue <= getDateKey()
  const actionHistory = record.actionHistory || (type === 'action' && record.progress?.endsWith('완료') ? [{ id: `action-history-${record.id}`, actionName: record.name, location: record.location, dateTime: record.dateTime, manager: record.actionAssignee || '미배정', progress: '조치 완료', approvalStatus: '승인대기', sourceType: '점검이력' }] : [])
  const inspectionHistory = record.inspectionHistory || (type === 'inspection' && record.progress?.endsWith('완료') ? [{ id: `inspection-history-${record.id}`, inspectionName: record.name, location: record.location, dateTime: record.dateTime, manager: record.inspectionAssignee || '미배정', progress: '점검 완료', movedToAction: false, content: '' }] : [])
  return { ...record, name: type === 'action' ? ACTION_NAME_BY_INSPECTION[record.name] || record.name : record.name, type, nextDue, progress: isDue ? toPendingStatus(type) : record.progress, inspectionHistory, actionHistory }
}
// eslint-disable-next-line react-refresh/only-export-components
export const CHECKLIST_MANAGEMENT_MOCK_RECORDS = rows.map(([name,category,location,cycle,inspectionAssignee,actionAssignee,dateTime,progress], index) => {
  const isAction = progress.startsWith('조치')
  const actionName = isAction ? ACTION_NAME_BY_INSPECTION[name] || name : name
  return normalizeRecord({ id:index+1,name:actionName,category,location,cycle:isAction ? null : cycle,inspectionAssignee,actionAssignee,dateTime,progress, type:isAction ? 'action' : 'inspection', nextDue:isAction ? null : dateTime.slice(0, 10) })
})
const getInitialRecords = () => {
  const stored = getStoredChecklistManagementRecords()
  const storedIds = new Set(stored.map((item) => String(item.id)))
  return [...stored.map((item) => normalizeRecord({ ...item, dateTime: item.dateTime?.replace('T', ' ') })), ...CHECKLIST_MANAGEMENT_MOCK_RECORDS.filter((item) => !storedIds.has(String(item.id)))]
}
const isInspectionRecord = (item) => getRecordType(item) === 'inspection'

function ChecklistManagementPage() {
//const [records, setRecords] = useState(() => getInitialRecords())   -   localStorage/목업을 넣으면 실제 DB 데이터가 표시되기 전 잠깐 목업 목록이 나올 수 있음
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState({ query:'', category:'분류', status:'진행 상태' })
  const [recordTypeFilter, setRecordTypeFilter] = useState('inspection')
  const [dateOffsetFilter, setDateOffsetFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState([])
  const [detailItem, setDetailItem] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [assignmentMode, setAssignmentMode] = useState(null)
  const [memberQuery, setMemberQuery] = useState('')
  const [managerOptions, setManagerOptions] = useState([])
  const [cctvs, setCctvs] = useState([])
  const [isRecordsLoading, setIsRecordsLoading] = useState(true)
  useEffect(() => {
    const loadRecords = async () => {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      try {
        const [inspectionResponse, actionResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/inspection/histories/all`, { headers }),
          axios.get(`${API_BASE_URL}/api/action-histories`, { headers }),
        ])
        const inspectionHistories = Array.isArray(inspectionResponse.data) ? inspectionResponse.data : []
        const actions = Array.isArray(actionResponse.data?.items) ? actionResponse.data.items : []
        const inspectionRecords = inspectionHistories
          .filter((item) => !item.is_action_required)
          .map((item) => normalizeRecord({
            id: `inspection-${item.inspection_history_id}`,
            rawId: item.inspection_history_id,
            sourceKind: 'inspection',
            name: item.name || '점검 이력',
            category: item.category_name || '기타',
            location: item.location || '구역 미지정',
            cycle: '정기',
            inspectionAssignee: item.user_name || '',
            actionAssignee: '',
            dateTime: String(item.date || '').replace('T', ' ').slice(0, 16),
            progress: item.status || '점검 대기',
            type: 'inspection',
          }))
        const actionRecords = actions.map((item) => normalizeRecord({
          id: `action-${item.action_history_id}`,
          rawId: item.action_history_id,
          sourceKind: 'action',
          name: item.action_name || '조치 이력',
          category: item.category_name || item.category || '기타',
          location: item.location || '구역 미지정',
          cycle: '수시',
          inspectionAssignee: item.approver_name || '',
          actionAssignee: item.handler_name || '',
          dateTime: String(item.created_at || '').replace('T', ' ').slice(0, 16),
          progress: item.action_status || '조치 대기',
          type: 'action',
        }))
        setRecords([...inspectionRecords, ...actionRecords])
      } catch (error) {
        console.warn('체크리스트 이력을 불러오지 못했습니다.', error)
      } finally {
        setIsRecordsLoading(false)
      }
    }
    loadRecords()
  }, [])
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined
        const managerResponse = await axios.get(`${API_BASE_URL}/api/action-histories/handlers`, { headers })
        const managerItems = Array.isArray(managerResponse.data?.items) ? managerResponse.data.items : []
        setManagerOptions(managerItems.map((manager) => ({ name: manager.name, userId: manager.uid })))
      } catch (error) {
        console.warn('체크리스트 등록 옵션을 불러오지 못했습니다.', error)
      }
    }
    loadOptions()
  }, [])
  const changeFilter = (key, value) => { setFilters((current) => ({ ...current, [key]:value })); setPage(0) }
  const typeRecords = useMemo(() => records
    .filter((item) => getRecordType(item) === recordTypeFilter)
    .filter((item) => recordTypeFilter !== 'action' || item.progress !== '조치 완료')
    .map((item) => {
      if (recordTypeFilter !== 'inspection') return item
      const dueDateTime = getInspectionDueDate(item)
      return { ...item, dateTime: dueDateTime, nextDue: dueDateTime.slice(0, 10) }
    }), [records, recordTypeFilter])
  const filtered = useMemo(() => typeRecords.filter((item) => {
    const query = filters.query.trim().toLowerCase()
    const searchTarget = [
      item.name,
      item.location,
      item.inspectionAssignee,
      item.actionAssignee,
    ].filter(Boolean).join(' ').toLowerCase()

    return (!query || searchTarget.includes(query)) && (filters.category === '분류' || item.category === filters.category) && (filters.status === '진행 상태' || item.progress === filters.status) && (recordTypeFilter !== 'inspection' || matchesDateOffset(item.dateTime, dateOffsetFilter))
  }).sort((a, b) => Number(b.progress.endsWith('대기')) - Number(a.progress.endsWith('대기'))), [typeRecords, filters, dateOffsetFilter, recordTypeFilter])
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8)); const active = Math.min(page, pageCount - 1); const visible = filtered.slice(active * 8, active * 8 + 8)
  const chosen = records.filter((item) => selected.includes(item.id)); const actionEnabled = chosen.length > 0 && chosen.every((item) => getRecordType(item) === 'action' && item.progress === '조치 대기')
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current,id])
  const reset = () => { setFilters({ query:'', category:'분류', status:'진행 상태' }); setRecordTypeFilter('inspection'); setDateOffsetFilter('all'); setSelected([]); setPage(0) }
  const changeRecordType = (type) => {
    setRecordTypeFilter(type)
    setFilters((current) => ({ ...current, status: '진행 상태' }))
    setSelected([])
    setPage(0)
  }
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
          sourceReportId: item.sourceReportId,
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
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      if (assignmentMode === 'inspection') {
        await Promise.all(targetRecords
          .filter((item) => item.sourceKind === 'inspection' && item.rawId)
          .map((item) => axios.patch(`${API_BASE_URL}/api/inspection/histories/${item.rawId}`, { uid: member.userId }, { headers })))
      } else {
        const actionIds = targetRecords.filter((item) => item.sourceKind === 'action' && item.rawId).map((item) => item.rawId)
        if (actionIds.length) await axios.patch(`${API_BASE_URL}/api/action-histories/assignments`, { action_history_ids: actionIds, handler_uid: member.userId }, { headers })
      }
      setRecords((current) => current.map((item) => selected.includes(item.id) ? { ...item, [field]: member.name } : item))
      setSelected([]); setMemberQuery(''); setAssignmentMode(null)
    } catch (error) {
      console.error('담당자 DB 배정 실패:', error)
      alert('담당자 배정에 실패했습니다.')
    }
  }
  const members = (managerOptions.length ? managerOptions : MANAGERS.map((name) => ({ name, userId: null }))).filter((member) => member.name.includes(memberQuery.trim()))
  return <section className={`checklist-management-page${isRecordsLoading ? ' is-data-loading' : ''}`} aria-busy={isRecordsLoading}>
    <article className="management-table-card"><div className="management-table-header"><div><span className="section-kicker">CHECKLIST OVERVIEW</span><h3>담당자 배정</h3><p>일시를 확인하고 점검·조치 담당자를 배정합니다.</p></div><div className="management-header-actions"><button className="checklist-create-button" type="button" onClick={() => setIsCreateOpen(true)}><AddRoundedIcon /> 항목 추가</button><div className="assignment-type-toggle" role="tablist" aria-label="항목 유형"><button className={recordTypeFilter === 'inspection' ? 'is-active' : ''} type="button" role="tab" aria-selected={recordTypeFilter === 'inspection'} onClick={() => changeRecordType('inspection')}>점검</button><button className={recordTypeFilter === 'action' ? 'is-active' : ''} type="button" role="tab" aria-selected={recordTypeFilter === 'action'} onClick={() => changeRecordType('action')}>조치</button></div></div></div>
    <div className="management-filters"><Filter value={filters.category} onChange={(value) => changeFilter('category',value)} options={CATEGORY} /><label className="management-search"><SearchRoundedIcon /><input value={filters.query} onChange={(event) => changeFilter('query', event.target.value)} placeholder="점검 이름, 구역, 담당자 검색" /></label><Filter value={filters.status} onChange={(value) => changeFilter('status',value)} options={STATUS_FILTER_OPTIONS[recordTypeFilter]} />{recordTypeFilter === 'inspection' && <div className="assignment-date-toggle" aria-label="점검 예정일">{DATE_FILTER_OPTIONS.map((option) => <button className={dateOffsetFilter === option.value ? 'is-active' : ''} type="button" key={option.key} onClick={() => { setDateOffsetFilter(option.value); setPage(0) }}>{option.label}</button>)}</div>}<button className="filter-reset" type="button" onClick={reset}><RestartAltRoundedIcon /> 초기화</button></div>
    <div className="bulk-assign-toolbar"><span>선택 <strong>{selected.length}</strong>건</span><div>{recordTypeFilter === 'inspection' ? <button type="button" disabled={!chosen.length} onClick={() => setAssignmentMode('inspection')}><AssignmentIndOutlinedIcon /> 점검 담당자 배정</button> : <button type="button" disabled={!actionEnabled} onClick={() => setAssignmentMode('action')}><AssignmentIndOutlinedIcon /> 조치 담당자 배정</button>}</div></div>
    <div className="checklist-table-wrap"><table className="checklist-management-table master-checklist-table"><thead><tr><th className="checklist-select-col"><input type="checkbox" checked={visible.length > 0 && visible.every((item) => selected.includes(item.id))} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current,...visible.map((item) => item.id)])] : current.filter((id) => !visible.some((item) => item.id === id)))} /></th><th>점검 이름</th><th>적용 구역</th><th>점검 담당자</th>{recordTypeFilter === 'action' && <th>조치 담당자</th>}{recordTypeFilter === 'inspection' && <th>일시</th>}<th>진행 상태</th></tr></thead><tbody>{isRecordsLoading ? <ChecklistTableSkeletonRows /> : visible.map((item) => <tr className="checklist-detail-row" key={item.id} onClick={() => setDetailItem(item)}><td className="checklist-select-col"><input type="checkbox" checked={selected.includes(item.id)} onClick={(event) => event.stopPropagation()} onChange={() => toggle(item.id)} /></td><td><strong>{item.name}</strong><span className="table-category">{item.category}</span></td><td><span className="location-cell">{item.location}</span></td><td><Assignee value={item.inspectionAssignee} /></td>{recordTypeFilter === 'action' && <td><Assignee value={item.actionAssignee} /></td>}{recordTypeFilter === 'inspection' && <td>{item.dateTime}</td>}<td><Status value={item.progress} /></td></tr>)}</tbody></table></div>
    <footer className="checklist-pagination"><span>총 <strong>{filtered.length}</strong>건</span><div><button type="button" disabled={active === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftRoundedIcon /></button><b>{active + 1} / {pageCount}</b><button type="button" disabled={active === pageCount - 1} onClick={() => setPage((current) => current + 1)}><ChevronRightRoundedIcon /></button></div></footer></article>{detailItem && <ChecklistDetailModal item={detailItem} onCycleChange={updateCycle} onClose={() => setDetailItem(null)} />}{isCreateOpen && <CreateModal initialType={recordTypeFilter} onClose={() => setIsCreateOpen(false)} onCreate={addItem} />}{assignmentMode && <AssignmentModal mode={assignmentMode} count={selected.length} members={members} query={memberQuery} onQueryChange={setMemberQuery} onAssign={assignMember} onClose={() => { setMemberQuery(''); setAssignmentMode(null) }} />}</section>
}
function ChecklistTableSkeletonRows() { return Array.from({ length: 8 }, (_, rowIndex) => <tr className="table-skeleton-row" key={rowIndex}>{Array.from({ length: 6 }, (_, columnIndex) => <td key={columnIndex}><span className={`table-skeleton-block column-${columnIndex}`} /></td>)}</tr>) }
function Filter({ value, options, onChange }) { const [isOpen, setIsOpen] = useState(false); return <div className={`management-filter-select${isOpen ? ' is-open' : ''}`}><button type="button" onClick={() => setIsOpen((open) => !open)}><span>{value}</span><ExpandMoreRoundedIcon /></button>{isOpen && <div className="management-select-menu">{options.map((option) => <button type="button" className={option === value ? 'is-selected' : ''} key={option} onClick={() => { onChange(option); setIsOpen(false) }}>{option}{option === value && <span>✓</span>}</button>)}</div>}</div> }
function Assignee({ value }) { if (!value) return <span className="no-photo">미배정</span>; if (value === '게시판') return <span className="assignee-cell is-board-source"><i>게시판</i></span>; return <span className="assignee-cell"><i>{value[0]}</i>{value}</span> }
function Status({ value = '' }) { return <span className={`checklist-status ${value.endsWith('완료') ? 'is-complete' : value === '조치 대기' ? 'is-pending' : 'is-progress'}`}>{value || '-'}</span> }
function ChecklistDetailModal({ item, onCycleChange, onClose }) {
  const inspectionCycle = item.cycle || '수시'
  const inspectionContent = item.content || '-'
  const locations = item.location.split(',').map((location) => location.trim()).filter(Boolean)
  const isInspection = isInspectionRecord(item)
  const inspectionHistory = (item.inspectionHistory || []).map((entry) => ({
    date: entry.date || entry.dateTime || item.dateTime,
    location: entry.location || item.location,
    manager: entry.manager || item.inspectionAssignee || '',
    status: entry.status || entry.progress || item.progress,
  }))
  const actionHistory = (item.actionHistory || (item.progress.startsWith('조치') ? [{ date:item.dateTime, manager:item.actionAssignee || '', status:item.progress }] : [])).map((entry) => ({
    date: entry.date || entry.dateTime || item.dateTime,
    manager: entry.manager || item.actionAssignee || '',
    status: entry.status || entry.progress || item.progress,
  }))

  return <div className="assignment-modal-backdrop" onMouseDown={onClose}><section className="checklist-detail-modal master-detail-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CHECKLIST DETAIL</span><h3>{item.name}</h3><p>{isInspection ? `${item.category} · ${item.cycle} 점검` : `${item.category} · 조치 항목`}</p></div><button type="button" aria-label="닫기" onClick={onClose}>×</button></header><div className="master-detail-body"><section className="master-summary-grid"><div><span>점검 주기</span><strong>{inspectionCycle}</strong></div><div><span>일시</span><strong>{item.dateTime}</strong></div><div><span>점검 담당자</span><strong>{item.inspectionAssignee || '미배정'}</strong></div><div><span>진행 상태</span><Status value={item.progress} /></div></section><section className="master-info-grid"><div className="is-wide"><span>내용</span><p>{inspectionContent}</p></div></section><section><div className="master-section-heading"><h4>적용 구역</h4><span>{locations.length}곳</span></div><div className="master-location-list">{locations.map((location) => <span key={location}>{location}</span>)}</div></section><section><div className="master-section-heading"><h4>점검 이력</h4><span>최근 {inspectionHistory.length}건</span></div><div className="master-history-list">{inspectionHistory.map((entry, index) => <div key={`${entry.date}-${index}`}><span>{entry.date}</span><strong>{entry.location}</strong><span>{entry.manager}</span><Status value={entry.status} /></div>)}</div></section><section><div className="master-section-heading"><h4>조치 이력</h4><span>{actionHistory.length}건</span></div>{actionHistory.length ? <div className="master-history-list">{actionHistory.map((entry) => <div key={entry.date}><span>{entry.date}</span><strong>{entry.manager}</strong><span>조치 담당자</span><Status value={entry.status} /></div>)}</div> : <div className="checklist-empty">등록된 조치 이력이 없습니다.</div>}</section></div><footer><span>점검 및 조치 진행 내역을 확인합니다.</span><button type="button" onClick={onClose}>닫기</button></footer></section></div>
}
function AssignmentModal({ mode, count, members, query, onQueryChange, onAssign, onClose }) { const title = mode === 'inspection' ? '점검 담당자 배정' : '조치 담당자 배정'; return <div className="assignment-modal-backdrop" onMouseDown={onClose}><section className="assignment-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ASSIGNMENT</span><h3>{title}</h3><p>선택한 {count}개 항목에 담당자를 일괄 배정합니다.</p></div><button type="button" aria-label="닫기" onClick={onClose}>×</button></header><div className="assignment-member-section"><div className="assignment-section-heading"><div><span>MANAGER LIST</span><h4>담당자 선택</h4></div><label><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="이름 검색" /></label></div><div className="assignment-member-list">{members.map((member) => <button type="button" className="assignment-member" key={member.userId ?? member.name} onClick={() => onAssign(member)}><span className="member-avatar">{member.name[0]}</span><span className="member-copy"><strong>{member.name}</strong><small>현장 담당자</small></span><span className="member-availability is-available">배정</span></button>)}{!members.length && <p className="member-empty">검색 결과가 없습니다.</p>}</div></div><footer><span>담당자를 선택하면 즉시 배정됩니다.</span><button type="button" onClick={onClose}>닫기</button></footer></section></div> }
function CreateModal({ initialType, onClose, onCreate }) {
  const isInspection = initialType === 'inspection'
  const [form, setForm] = useState({ name:'', location:'', category:CATEGORY[0], cycle:'매일', dateTime:`${getDateKey()}T09:00` })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    if (!form.name.trim() || !form.location.trim()) return
    setIsSubmitting(true)
    if (isInspection) {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      try {
        const beforeListResponse = await axios.get(`${API_BASE_URL}/api/inspection`, { headers })
        const beforeInspectionList = Array.isArray(beforeListResponse.data)
          ? beforeListResponse.data
          : (beforeListResponse.data?.items ?? beforeListResponse.data?.inspections ?? [])
        const hasSameName = (item) => item.name === form.name.trim()
        const isCreatedInspection = (item) => (
          hasSameName(item)
          && item.location === form.location.trim()
          && item.cycle === form.cycle
          && Number(item.category_id) === Number(CATEGORY_ID_BY_NAME[form.category] ?? 4)
        )
        if (beforeInspectionList.some(hasSameName)) {
          alert('같은 이름의 점검 항목이 이미 등록되어 있습니다.')
          setIsSubmitting(false)
          return
        }

        const beforeInspectionIds = new Set(
          beforeInspectionList.map((item) => String(item.inspection_id ?? item.id)),
        )
        let inspectionId
        try {
          const inspectionResponse = await axios.post(`${API_BASE_URL}/api/inspection`, {
            name: form.name.trim(),
            location: form.location.trim(),
            cycle: form.cycle,
            content: null,
            category_id: CATEGORY_ID_BY_NAME[form.category] ?? 4,
          }, { headers })
          const inspectionBody = inspectionResponse.data?.data ?? inspectionResponse.data?.item ?? inspectionResponse.data
          inspectionId = inspectionBody?.inspection_id ?? inspectionBody?.id
        } catch (error) {
          // 백엔드가 저장 후 응답 직렬화에서 실패하는 경우를 대비해 생성된 항목을 다시 찾습니다.
          const listResponse = await axios.get(`${API_BASE_URL}/api/inspection`, { headers })
          const inspectionList = Array.isArray(listResponse.data)
            ? listResponse.data
            : (listResponse.data?.items ?? listResponse.data?.inspections ?? [])
          const createdInspection = inspectionList
            .filter((item) => (
              isCreatedInspection(item)
              && !beforeInspectionIds.has(String(item.inspection_id ?? item.id))
            ))
            .sort((left, right) => Number(right.inspection_id ?? right.id ?? 0) - Number(left.inspection_id ?? left.id ?? 0))[0]
          inspectionId = createdInspection?.inspection_id ?? createdInspection?.id
          if (!inspectionId) throw error
        }

        if (!Number.isInteger(Number(inspectionId))) {
          throw new Error('점검 항목 생성 응답에 inspection_id가 없습니다.')
        }

        await axios.post(`${API_BASE_URL}/api/inspection/histories/create`, {
          name: form.name.trim(),
          date: form.dateTime,
          location: form.location.trim(),
          uid: null,
          user_name: null,
          status: '점검 대기',
          is_action_required: false,
          content: null,
          inspection_id: Number(inspectionId),
        }, { headers })
      } catch (error) {
        console.error('점검 항목/이력 생성 실패:', error.response?.data ?? error)
        alert('점검 이력 생성에 실패했습니다.')
        setIsSubmitting(false)
        return
      }
    }
    onCreate({
      ...form,
      type: initialType,
      cycle: isInspection ? form.cycle : null,
      name: form.name.trim(),
      location: form.location.trim(),
      inspectionAssignee:'',
      actionAssignee:'',
      progress: isInspection ? '점검 대기' : '조치 대기',
    })
    setIsSubmitting(false)
  }
  return <div className="assignment-modal-backdrop" onMouseDown={onClose}><section className="assignment-modal checklist-create-modal" onMouseDown={(event) => event.stopPropagation()}><header><div><span>ITEM CREATE</span><h3>{isInspection ? '점검 항목 추가' : '조치 항목 추가'}</h3><p>전체 체크리스트에 새 항목을 등록합니다.</p></div><button type="button" onClick={onClose} disabled={isSubmitting}>×</button></header><form className="checklist-create-form" onSubmit={submit}><label className="is-wide"><span>{isInspection ? '점검 이름' : '조치 이름'}</span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder={isInspection ? '예: 비상구 피난 통로 점검' : '예: 소화기 압력 게이지 교체'} disabled={isSubmitting} /></label><label><span>분류</span><select value={form.category} onChange={(event) => update('category', event.target.value)} disabled={isSubmitting}>{CATEGORY.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>{isInspection && <label><span>점검 주기</span><select value={form.cycle} onChange={(event) => update('cycle', event.target.value)} disabled={isSubmitting}><option>매일</option><option>매주</option><option>매월</option></select></label>}<label className="is-wide"><span>적용 구역</span><input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="여러 구역은 쉼표(,)로 구분하세요" disabled={isSubmitting} /></label><label><span>일시</span><input type="datetime-local" value={form.dateTime} onChange={(event) => update('dateTime', event.target.value)} disabled={isSubmitting} /></label><footer><span>{isSubmitting ? '등록 중입니다.' : (isInspection ? '점검 대기 상태로 등록됩니다.' : '조치 대기 상태로 등록됩니다.')}</span><div><button type="button" onClick={onClose} disabled={isSubmitting}>취소</button><button type="submit" disabled={isSubmitting}>{isSubmitting ? '등록 중...' : '등록'}</button></div></footer></form></section></div>
}
export default ChecklistManagementPage



