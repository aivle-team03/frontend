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

const CATEGORY = ['소방안전', '시설안전', '산업안전', '기타']
const API_BASE_URL = 'http://127.0.0.1:8000'

const rangeText = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number)
  return `${year}. ${String(month).padStart(2, '0')}. 01 - ${year}. ${String(month).padStart(2, '0')}. ${new Date(year, month, 0).getDate()}`
}

function ChecklistManagementPage() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    query: '',
    category: '분류',
    inspection: '점검 담당자',
    action: '조치 담당자',
    status: '진행 상태',
  })
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

  // 1. 전체 데이터 (점검 이력 + 조치 이력) 로드 및 5개 유형 데이터 정제
  const fetchAllChecklistRecords = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined

      // 점검 이력과 조치 이력을 동시에 불러옴
      const [inspectionRes, actionRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inspection/histories/all`, { headers: authHeader }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/action-histories`, { headers: authHeader }).catch(() => ({ data: { items: [] } })),
      ])

      const inspectionData = Array.isArray(inspectionRes.data) ? inspectionRes.data : []
      const actionData = actionRes.data?.items || (Array.isArray(actionRes.data) ? actionRes.data : [])

      const normalizedList = []

      // (1) 점검 이력 변환 (점검만 있는 경우 & 점검+조치 연결)
      inspectionData.forEach((item) => {
        const locations = item.location ? item.location.split(',').map((l) => l.trim()).filter(Boolean) : ['구역 미지정']
        locations.forEach((loc, locIdx) => {
          const idKey = `insp-${item.inspection_history_id}-${locIdx}`
          let progressStatus = item.status || '점검 대기'
          if (item.status === '점검 완료' && item.is_action_required) {
            progressStatus = '조치 대기' // 점검 완료되었으나 추가 조치가 필요한 건
          }

          normalizedList.push({
            id: idKey,
            rawId: item.inspection_history_id,
            sourceKind: 'inspection',
            name: item.name || '정기 점검',
            category: item.category || '기타',
            location: loc,
            fullLocations: locations,
            cycle: item.cycle || '매주',
            inspectionAssignee: item.user_name || item.inspector_name || (item.uid ? `사용자 #${item.uid}` : ''),
            actionAssignee: '',
            dateTime: item.date ? String(item.date).replace('T', ' ').slice(0, 16) : '',
            progress: progressStatus,
            isActionRequired: Boolean(item.is_action_required),
            rawItem: item,
          })
        })
      })

      // (2) 조치 이력 변환 (게시판+조치, 이벤트+조치, 직접추가 조치)
      actionData.forEach((item) => {
        // 출처에 따른 점검 담당자(출처 제공자) 표기 결정
        let inspectionAssigneeText = ''
        if (item.source_type === '게시판') {
          inspectionAssigneeText = '게시판'
        } else if (item.source_type === '이벤트') {
          inspectionAssigneeText = 'CCTV'
        } else if (item.source_type === '점검이력') {
          inspectionAssigneeText = item.handler_name || '점검 담당자'
        } else {
          inspectionAssigneeText = item.approver_name || '관리자'
        }

        const idKey = `act-${item.action_history_id}`
        normalizedList.push({
          id: idKey,
          rawId: item.action_history_id,
          sourceKind: 'action',
          sourceType: item.source_type,
          name: item.action_name,
          category: item.category || '기타',
          location: item.location || '현장 구역',
          fullLocations: [item.location || '현장 구역'],
          cycle: '수시',
          inspectionAssignee: inspectionAssigneeText,
          actionAssignee: item.handler_name || '',
          dateTime: item.created_at ? String(item.created_at).replace('T', ' ').slice(0, 16) : '',
          progress: item.action_status || '조치 대기',
          rawItem: item,
        })
      })

      setRecords(normalizedList)
    } catch (error) {
      console.error('체크리스트 전체 데이터를 불러오는데 실패했습니다:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. 담당자 옵션 및 CCTV 정보 로드
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const token = localStorage.getItem('token')
        const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined

        const [managerResponse, cctvResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/action-histories/handlers`, { headers: authHeader }).catch(() => ({ data: { items: [] } })),
          axios.get(`${API_BASE_URL}/api/cctvs`, { headers: authHeader }).catch(() => ({ data: [] })),
        ])

        const handlers = managerResponse.data?.items || (Array.isArray(managerResponse.data) ? managerResponse.data : [])
        setManagerOptions(handlers.map((m) => ({ name: m.name, userId: m.uid })))
        setCctvs(Array.isArray(cctvResponse.data) ? cctvResponse.data : [])
      } catch (error) {
        console.warn('담당자/CCTV 옵션을 불러오지 못했습니다.', error)
      }
    }

    fetchAllChecklistRecords()
    loadOptions()
  }, [])

  const changeFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(0)
  }

  const filtered = useMemo(() => {
    return records
      .filter((item) => {
        const isQueryMatch =
          !filters.query ||
          item.name.toLowerCase().includes(filters.query.toLowerCase()) ||
          item.location.toLowerCase().includes(filters.query.toLowerCase())
        const isCategoryMatch = filters.category === '분류' || item.category === filters.category
        const isInspectionMatch = filters.inspection === '점검 담당자' || item.inspectionAssignee === filters.inspection
        const isActionMatch = filters.action === '조치 담당자' || item.actionAssignee === filters.action
        const isStatusMatch = filters.status === '진행 상태' || item.progress === filters.status
        const isPeriodMatch = !usePeriod || item.dateTime.startsWith(periodMonth)

        return isQueryMatch && isCategoryMatch && isInspectionMatch && isActionMatch && isStatusMatch && isPeriodMatch
      })
      .sort((a, b) => Number(b.progress.endsWith('대기')) - Number(a.progress.endsWith('대기')))
  }, [records, filters, periodMonth, usePeriod])

  const pageCount = Math.max(1, Math.ceil(filtered.length / 8))
  const active = Math.min(page, pageCount - 1)
  const visible = filtered.slice(active * 8, active * 8 + 8)

  const chosen = records.filter((item) => selected.includes(item.id))
  const actionEnabled = chosen.length > 0 && chosen.every((item) => item.progress === '조치 대기')

  const stats = [
    ['전체 체크리스트', records.length, '등록된 기준 항목', ChecklistOutlinedIcon],
    ['점검 대기', records.filter((item) => item.progress === '점검 대기').length, '점검 진행이 필요해요', PendingActionsOutlinedIcon],
    ['조치 대기', records.filter((item) => item.progress === '조치 대기').length, '조치 등록이 필요해요', PendingActionsOutlinedIcon],
    ['담당자 미배정', records.filter((item) => !item.inspectionAssignee && !item.actionAssignee).length, '빠른 배정이 필요해요', TaskAltRoundedIcon],
  ]

  const toggle = (id) =>
    setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))

  const reset = () => {
    setFilters({ query: '', category: '분류', inspection: '점검 담당자', action: '조치 담당자', status: '진행 상태' })
    setPeriodMonth('2026-07')
    setUsePeriod(false)
    setPage(0)
  }

  // 3. 직접 조치/점검 항목 신규 추가 API 연동
  const addItem = async (item) => {
    try {
      const token = localStorage.getItem('token')
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined

      if (item.type === 'action') {
        // 직접 추가 조치 API 호출
        await axios.post(
          `${API_BASE_URL}/api/action-histories`,
          {
            source_type: '직접추가',
            action_name: item.name,
            category_id: 1, // 기본 카테고리
            location: item.location,
            content: item.content || item.name,
          },
          { headers: authHeader }
        )
      }
      alert('항목이 성공적으로 등록되었습니다.')
      setIsCreateOpen(false)
      fetchAllChecklistRecords()
    } catch (error) {
      console.error('항목 추가에 실패했습니다:', error)
      alert(error.response?.data?.detail || '항목 추가에 실패했습니다.')
    }
  }

  // 4. 일괄 담당자 배정 API 연동
  const assignMember = async (member) => {
    const targetRecords = records.filter((item) => selected.includes(item.id))
    try {
      const token = localStorage.getItem('token')
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined

      // 조치 항목들에 대한 일괄 배정
      const actionTargets = targetRecords.filter((item) => item.sourceKind === 'action')
      if (actionTargets.length > 0) {
        await axios.patch(
          `${API_BASE_URL}/api/action-histories/assignments`,
          {
            action_history_ids: actionTargets.map((item) => item.rawId),
            handler_uid: member.userId,
          },
          { headers: authHeader }
        )
      }

      alert('담당자 배정이 완료되었습니다.')
      setSelected([])
      setMemberQuery('')
      setAssignmentMode(null)
      fetchAllChecklistRecords()
    } catch (error) {
      console.error('체크리스트 담당자 DB 배정 실패:', error)
      alert(error.response?.data?.detail || '담당자 배정에 실패했습니다.')
    }
  }

  const managerNames = managerOptions.map((m) => m.name)
  const members = managerOptions.filter((member) => member.name.includes(memberQuery.trim()))

  return (
    <section className="checklist-management-page">
      <div className="checklist-metrics">
        {stats.map(([label, value, note, Icon], index) => (
          <article className={`checklist-metric metric-${index}`} key={label}>
            <span className="metric-heading">
              <i>
                <Icon />
              </i>
              {label}
            </span>
            <strong>
              {value}
              <small>건</small>
            </strong>
            <p>{note}</p>
          </article>
        ))}
      </div>

      <article className="management-table-card">
        <div className="management-table-header">
          <div>
            <span className="section-kicker">CHECKLIST OVERVIEW</span>
            <h3>전체 체크리스트</h3>
            <p>일시를 확인하고 점검·조치 담당자를 배정합니다.</p>
          </div>
          <div className="management-header-actions">
            <button className="checklist-create-button" type="button" onClick={() => setIsCreateOpen(true)}>
              <AddRoundedIcon /> 항목 추가
            </button>
            <div className="date-filter">
              <button type="button" onClick={() => setIsDateOpen((open) => !open)}>
                <CalendarTodayOutlinedIcon />
                <span>{rangeText(periodMonth)}</span>
              </button>
              {isDateOpen && (
                <div className="date-filter-menu">
                  <label>
                    조회 월
                    <input
                      type="month"
                      value={periodMonth}
                      onChange={(event) => {
                        setPeriodMonth(event.target.value)
                        setUsePeriod(true)
                        setPage(0)
                        setIsDateOpen(false)
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="management-filters">
          <label className="management-search">
            <SearchRoundedIcon />
            <input
              value={filters.query}
              onChange={(event) => changeFilter('query', event.target.value)}
              placeholder="점검 이름 또는 구역 검색"
            />
          </label>
          <Filter value={filters.category} onChange={(value) => changeFilter('category', value)} options={CATEGORY} />
          <Filter
            value={filters.inspection}
            onChange={(value) => changeFilter('inspection', value)}
            options={['점검 담당자', ...managerNames]}
          />
          <Filter
            value={filters.action}
            onChange={(value) => changeFilter('action', value)}
            options={['조치 담당자', ...managerNames]}
          />
          <Filter
            value={filters.status}
            onChange={(value) => changeFilter('status', value)}
            options={['진행 상태', '점검 대기', '점검 완료', '조치 대기', '조치 완료']}
          />
          <button className="filter-reset" type="button" onClick={reset}>
            <RestartAltRoundedIcon /> 초기화
          </button>
        </div>

        <div className="bulk-assign-toolbar">
          <span>
            선택 <strong>{selected.length}</strong>건
          </span>
          <div>
            <button type="button" disabled={!chosen.length} onClick={() => setAssignmentMode('inspection')}>
              <AssignmentIndOutlinedIcon /> 점검 담당자 배정
            </button>
            <button type="button" disabled={!actionEnabled} onClick={() => setAssignmentMode('action')}>
              <AssignmentIndOutlinedIcon /> 조치 담당자 배정
            </button>
          </div>
        </div>

        <div className="checklist-table-wrap">
          <table className="checklist-management-table master-checklist-table">
            <thead>
              <tr>
                <th className="checklist-select-col">
                  <input
                    type="checkbox"
                    checked={visible.length > 0 && visible.every((item) => selected.includes(item.id))}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...new Set([...current, ...visible.map((item) => item.id)])]
                          : current.filter((id) => !visible.some((item) => item.id === id))
                      )
                    }
                  />
                </th>
                <th>점검/조치 이름</th>
                <th>적용 구역</th>
                <th>점검 담당자</th>
                <th>조치 담당자</th>
                <th>일시</th>
                <th>진행 상태</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="checklist-empty">
                    목록을 불러오는 중입니다...
                  </td>
                </tr>
              ) : visible.length > 0 ? (
                visible.map((item) => (
                  <tr className="checklist-detail-row" key={item.id} onClick={() => setDetailItem(item)}>
                    <td className="checklist-select-col">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggle(item.id)}
                      />
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      <span className="table-category">{item.category}</span>
                    </td>
                    <td>
                      <span className="location-cell">{item.location}</span>
                    </td>
                    <td>
                      <Assignee value={item.inspectionAssignee} />
                    </td>
                    <td>
                      <Assignee value={item.actionAssignee} />
                    </td>
                    <td>{item.dateTime}</td>
                    <td>
                      <Status value={item.progress} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="checklist-empty">
                    조건에 맞는 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="checklist-pagination">
          <span>
            총 <strong>{filtered.length}</strong>건
          </span>
          <div>
            <button type="button" disabled={active === 0} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeftRoundedIcon />
            </button>
            <b>
              {active + 1} / {pageCount}
            </b>
            <button type="button" disabled={active === pageCount - 1} onClick={() => setPage((current) => current + 1)}>
              <ChevronRightRoundedIcon />
            </button>
          </div>
        </footer>
      </article>

      {/* 상세 모달 */}
      {detailItem && <ChecklistDetailModal item={detailItem} onClose={() => setDetailItem(null)} />}

      {/* 추가 모달 */}
      {isCreateOpen && <CreateModal cctvs={cctvs} onClose={() => setIsCreateOpen(false)} onCreate={addItem} />}

      {/* 담당자 배정 모달 */}
      {assignmentMode && (
        <AssignmentModal
          mode={assignmentMode}
          count={selected.length}
          members={members}
          query={memberQuery}
          onQueryChange={setMemberQuery}
          onAssign={assignMember}
          onClose={() => {
            setMemberQuery('')
            setAssignmentMode(null)
          }}
        />
      )}
    </section>
  )
}

function Filter({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={`management-filter-select${isOpen ? ' is-open' : ''}`}>
      <button type="button" onClick={() => setIsOpen((open) => !open)}>
        <span>{value}</span>
        <ExpandMoreRoundedIcon />
      </button>
      {isOpen && (
        <div className="management-select-menu">
          {options.map((option) => (
            <button
              type="button"
              className={option === value ? 'is-selected' : ''}
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option}
              {option === value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Assignee({ value }) {
  if (!value) return <span className="no-photo">미배정</span>
  if (value === '게시판') return <span className="assignee-cell is-board-source"><i>게시판</i></span>
  if (value === 'CCTV') return <span className="assignee-cell is-board-source"><i>CCTV</i></span>
  return (
    <span className="assignee-cell">
      <i>{value[0]}</i>
      {value}
    </span>
  )
}

function Status({ value }) {
  return (
    <span
      className={`checklist-status ${value.endsWith('완료') ? 'is-complete' : value === '조치 대기' ? 'is-pending' : 'is-progress'
        }`}
    >
      {value}
    </span>
  )
}

// 5. 상세 이력 모달 (과거 수행 이력 및 연결 조치 이력 표시)
function ChecklistDetailModal({ item, onClose }) {
  const locations = item.fullLocations || [item.location]
  const isInspection = item.sourceKind === 'inspection'

  const inspectionHistory = [
    {
      date: item.dateTime,
      location: item.location,
      manager: item.inspectionAssignee || '미배정',
      status: isInspection ? item.progress : '점검 완료',
    },
  ]

  const actionHistory = item.sourceKind === 'action' || item.isActionRequired
    ? [
      {
        date: item.dateTime,
        manager: item.actionAssignee || '미배정',
        status: item.progress,
      },
    ]
    : []

  return (
    <div className="assignment-modal-backdrop" onMouseDown={onClose}>
      <section className="checklist-detail-modal master-detail-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>CHECKLIST DETAIL</span>
            <h3>{item.name}</h3>
            <p>{isInspection ? `${item.category} · ${item.cycle} 점검` : `${item.category} · 조치 항목`}</p>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="master-detail-body">
          <section className="master-summary-grid">
            {isInspection && (
              <div>
                <span>점검 주기</span>
                <strong>{item.cycle}</strong>
              </div>
            )}
            <div>
              <span>일시</span>
              <strong>{item.dateTime}</strong>
            </div>
            <div>
              <span>점검 담당자</span>
              <strong>{item.inspectionAssignee || '미배정'}</strong>
            </div>
            <div>
              <span>진행 상태</span>
              <Status value={item.progress} />
            </div>
          </section>

          <section>
            <div className="master-section-heading">
              <h4>적용 구역</h4>
              <span>{locations.length}곳</span>
            </div>
            <div className="master-location-list">
              {locations.map((loc) => (
                <span key={loc}>{loc}</span>
              ))}
            </div>
          </section>

          <section>
            <div className="master-section-heading">
              <h4>점검 이력</h4>
              <span>최근 {inspectionHistory.length}건</span>
            </div>
            <div className="master-history-list">
              {inspectionHistory.map((entry, index) => (
                <div key={`${entry.date}-${index}`}>
                  <span>{entry.date}</span>
                  <strong>{entry.location}</strong>
                  <span>{entry.manager}</span>
                  <Status value={entry.status} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="master-section-heading">
              <h4>조치 이력</h4>
              <span>{actionHistory.length}건</span>
            </div>
            {actionHistory.length ? (
              <div className="master-history-list">
                {actionHistory.map((entry, idx) => (
                  <div key={`${entry.date}-${idx}`}>
                    <span>{entry.date}</span>
                    <strong>{entry.manager}</strong>
                    <span>조치 담당자</span>
                    <Status value={entry.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="checklist-empty">등록된 조치 이력이 없습니다.</div>
            )}
          </section>
        </div>
        <footer>
          <span>점검 및 조치 진행 내역을 확인합니다.</span>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </footer>
      </section>
    </div>
  )
}

function AssignmentModal({ mode, count, members, query, onQueryChange, onAssign, onClose }) {
  const title = mode === 'inspection' ? '점검 담당자 배정' : '조치 담당자 배정'
  return (
    <div className="assignment-modal-backdrop" onMouseDown={onClose}>
      <section className="assignment-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>ASSIGNMENT</span>
            <h3>{title}</h3>
            <p>선택한 {count}개 항목에 담당자를 일괄 배정합니다.</p>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="assignment-member-section">
          <div className="assignment-section-heading">
            <div>
              <span>MANAGER LIST</span>
              <h4>담당자 선택</h4>
            </div>
            <label>
              <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="이름 검색" />
            </label>
          </div>
          <div className="assignment-member-list">
            {members.map((member) => (
              <button
                type="button"
                className="assignment-member"
                key={member.userId ?? member.name}
                onClick={() => onAssign(member)}
              >
                <span className="member-avatar">{member.name[0]}</span>
                <span className="member-copy">
                  <strong>{member.name}</strong>
                  <small>현장 담당자</small>
                </span>
                <span className="member-availability is-available">배정</span>
              </button>
            ))}
            {!members.length && <p className="member-empty">검색 결과가 없습니다.</p>}
          </div>
        </div>
        <footer>
          <span>담당자를 선택하면 즉시 배정됩니다.</span>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </footer>
      </section>
    </div>
  )
}

function CreateModal({ onClose, onCreate }) {
  const [type, setType] = useState('inspection')
  const [form, setForm] = useState({
    name: '',
    location: '',
    category: CATEGORY[0],
    cycle: '매일',
    dateTime: '2026-07-29T09:00',
  })

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    if (form.name.trim() && form.location.trim()) {
      onCreate({
        ...form,
        type,
        name: form.name.trim(),
        location: form.location.trim(),
        inspectionAssignee: '',
        actionAssignee: '',
      })
    }
  }

  return (
    <div className="assignment-modal-backdrop" onMouseDown={onClose}>
      <section className="assignment-modal checklist-create-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>ITEM CREATE</span>
            <h3>{type === 'inspection' ? '점검 항목 추가' : '조치 항목 추가'}</h3>
            <p>전체 체크리스트에 새 항목을 등록합니다.</p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </header>
        <form className="checklist-create-form" onSubmit={submit}>
          <div className="item-type-toggle">
            <button className={type === 'inspection' ? 'is-active' : ''} type="button" onClick={() => setType('inspection')}>
              점검 항목
            </button>
            <button className={type === 'action' ? 'is-active' : ''} type="button" onClick={() => setType('action')}>
              조치 항목
            </button>
          </div>
          <label className="is-wide">
            <span>{type === 'inspection' ? '점검 이름' : '조치 이름'}</span>
            <input
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder={type === 'inspection' ? '예: 비상구 피난 통로 점검' : '예: 소화기 압력 게이지 교체'}
            />
          </label>
          <label>
            <span>분류</span>
            <select value={form.category} onChange={(event) => update('category', event.target.value)}>
              {CATEGORY.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>점검 주기</span>
            <select value={form.cycle} onChange={(event) => update('cycle', event.target.value)}>
              <option>매일</option>
              <option>매주</option>
              <option>매월</option>
            </select>
          </label>
          <label className="is-wide">
            <span>적용 구역</span>
            <input
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
              placeholder="여러 구역은 쉼표(,)로 구분하세요"
            />
          </label>
          <label>
            <span>시작 일시</span>
            <input
              type="datetime-local"
              value={form.dateTime}
              onChange={(event) => update('dateTime', event.target.value)}
            />
          </label>
          <footer>
            <span>{type === 'inspection' ? '점검 대기 상태로 등록됩니다.' : '조치 대기 상태로 등록됩니다.'}</span>
            <div>
              <button type="button" onClick={onClose}>
                취소
              </button>
              <button type="submit">등록</button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default ChecklistManagementPage