import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { useMemo, useState } from 'react'
import '../styles/checklist.css'

const INITIAL_CHECKLISTS = [
  { id: 1, name: '비상구 피난 통로 점검', category: '시설 안전', locations: ['A동 1층 복도', 'B동 1층 출입구'], cycle: '매일', nextDate: '2026-07-25', lastDate: '2026-07-24', lastResult: '점검 완료', history: [{ date: '2026-07-24 09:10', location: 'A동 1층 복도', inspector: '이안전', result: '점검 완료' }, { date: '2026-07-23 09:15', location: 'B동 1층 출입구', inspector: '이안전', result: '점검 완료' }] },
  { id: 2, name: '소화기 및 소방설비 점검', category: '화재 예방', locations: ['A동 2층 복도', 'C동 창고'], cycle: '매주', nextDate: '2026-07-28', lastDate: '2026-07-21', lastResult: '조치 필요', history: [{ date: '2026-07-21 14:00', location: 'A동 2층 복도', inspector: '김안전', result: '조치 필요' }, { date: '2026-07-14 14:05', location: 'C동 창고', inspector: '김안전', result: '점검 완료' }] },
  { id: 3, name: '운반 장비 방호설비 점검', category: '작업 안전', locations: ['A동 5층 작업장'], cycle: '매월', nextDate: '2026-08-01', lastDate: '2026-07-01', lastResult: '점검 완료', history: [{ date: '2026-07-01 10:20', location: 'A동 5층 작업장', inspector: '박점검', result: '점검 완료' }] },
  { id: 4, name: '전기 분전반 및 차단기 점검', category: '전기 안전', locations: ['C동 지하 1층'], cycle: '매월', nextDate: '2026-08-05', lastDate: '2026-07-05', lastResult: '점검 완료', history: [{ date: '2026-07-05 11:10', location: 'C동 지하 1층', inspector: '최점검', result: '점검 완료' }] },
]

const EMPTY_FORM = { name: '', category: '시설 안전', locations: '', cycle: '매일', nextDate: '2026-07-25' }

function ChecklistManagementPage() {
  const [records, setRecords] = useState(INITIAL_CHECKLISTS)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체 분류')
  const [selected, setSelected] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = useMemo(() => records.filter((item) => (
    (category === '전체 분류' || item.category === category)
    && (!query.trim() || item.name.includes(query.trim()) || item.locations.some((location) => location.includes(query.trim())))
  )), [category, query, records])

  const metrics = [
    ['전체 체크리스트', records.length, '점검 기준 항목', ChecklistOutlinedIcon],
    ['오늘 점검 대상', records.filter((item) => item.nextDate === '2026-07-25').length, '오늘 실행 목록에 반영', CalendarTodayOutlinedIcon],
    ['조치 필요 이력', records.filter((item) => item.lastResult === '조치 필요').length, '최근 점검 결과 기준', ScheduleOutlinedIcon],
  ]

  const createChecklist = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.locations.trim()) {
      alert('점검 이름과 구역을 입력해 주세요.')
      return
    }
    const locations = form.locations.split(',').map((location) => location.trim()).filter(Boolean)
    const record = {
      id: Date.now(),
      name: form.name.trim(),
      category: form.category,
      locations,
      cycle: form.cycle,
      nextDate: form.nextDate,
      lastDate: '-',
      lastResult: '점검 이력 없음',
      history: [],
    }
    setRecords((current) => [record, ...current])
    setForm(EMPTY_FORM)
    setIsCreateOpen(false)
  }

  return (
    <section className="checklist-management-page">
      <header className="checklist-management-intro">
        <div><span>CHECKLIST MASTER</span><h2>전체 체크리스트</h2><p>점검 기준, 적용 구역, 주기와 점검 이력을 관리합니다. 오늘의 점검 목록은 이 기준을 바탕으로 생성됩니다.</p></div>
      </header>

      <div className="checklist-metrics">
        {metrics.map(([label, value, note, Icon], index) => <article className={`checklist-metric metric-${index}`} key={label}><span className="metric-heading"><i><Icon /></i>{label}</span><strong>{value}<small>건</small></strong><p>{note}</p></article>)}
      </div>

      <article className="management-table-card">
        <div className="management-table-header">
          <div><span className="section-kicker"><ChecklistOutlinedIcon /> CHECKLIST OVERVIEW</span><h3>점검 기준 목록</h3><p>항목을 선택하면 구역별 점검 이력과 다음 점검 일정을 확인할 수 있습니다.</p></div>
          <button className="checklist-create-button" type="button" onClick={() => setIsCreateOpen(true)}><AddRoundedIcon /> 점검 기준 추가</button>
        </div>
        <div className="management-filters">
          <label className="management-search"><SearchRoundedIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="점검 이름 또는 구역 검색" /></label>
          <select className="master-category-filter" value={category} onChange={(event) => setCategory(event.target.value)}><option>전체 분류</option><option>시설 안전</option><option>화재 예방</option><option>작업 안전</option><option>전기 안전</option></select>
          <button className="filter-reset" type="button" onClick={() => { setQuery(''); setCategory('전체 분류') }}><RestartAltRoundedIcon /> 초기화</button>
        </div>
        <div className="checklist-table-wrap"><table className="checklist-management-table master-checklist-table"><thead><tr><th>점검 이름</th><th>분류</th><th>적용 구역</th><th>점검 주기</th><th>최근 점검일</th><th>최근 결과</th><th>다음 점검일</th></tr></thead><tbody>{filtered.map((item) => <tr className="checklist-detail-row" key={item.id} onClick={() => setSelected(item)}><td><strong>{item.name}</strong></td><td><span className="table-category">{item.category}</span></td><td><span className="location-cell"><LocationOnOutlinedIcon />{item.locations[0]}{item.locations.length > 1 && ` 외 ${item.locations.length - 1}곳`}</span></td><td>{item.cycle}</td><td>{item.lastDate}</td><td><MasterStatus value={item.lastResult} /></td><td>{item.nextDate}</td></tr>)}</tbody></table>{!filtered.length && <div className="checklist-empty">조건에 맞는 점검 기준이 없습니다.</div>}</div>
      </article>

      {selected && <ChecklistMasterDetail checklist={selected} onClose={() => setSelected(null)} />}
      {isCreateOpen && <ChecklistMasterCreate form={form} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onClose={() => setIsCreateOpen(false)} onSubmit={createChecklist} />}
    </section>
  )
}

function MasterStatus({ value }) { return <span className={`checklist-status ${value === '조치 필요' ? 'is-pending' : value === '점검 완료' ? 'is-complete' : 'is-progress'}`}>{value}</span> }

function ChecklistMasterDetail({ checklist, onClose }) {
  return <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="checklist-detail-modal master-detail-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CHECKLIST MASTER DETAIL</span><h3>{checklist.name}</h3><p>{checklist.category} · {checklist.cycle} 점검</p></div><button type="button" aria-label="닫기" onClick={onClose}><CloseRoundedIcon /></button></header><div className="master-detail-body"><section className="master-summary-grid"><div><span>점검 주기</span><strong>{checklist.cycle}</strong></div><div><span>다음 점검일</span><strong>{checklist.nextDate}</strong></div><div><span>최근 점검일</span><strong>{checklist.lastDate}</strong></div><div><span>최근 결과</span><MasterStatus value={checklist.lastResult} /></div></section><section><div className="master-section-heading"><h4>적용 구역</h4><span>{checklist.locations.length}곳</span></div><div className="master-location-list">{checklist.locations.map((location) => <span key={location}><LocationOnOutlinedIcon />{location}</span>)}</div></section><section><div className="master-section-heading"><h4>점검 이력</h4><span>최근 {checklist.history.length}건</span></div>{checklist.history.length ? <div className="master-history-list">{checklist.history.map((entry) => <div key={`${entry.date}-${entry.location}`}><span>{entry.date}</span><strong>{entry.location}</strong><span>{entry.inspector}</span><MasterStatus value={entry.result} /></div>)}</div> : <div className="checklist-empty">아직 점검 이력이 없습니다.</div>}</section></div><footer><span>점검 기준을 수정하면 이후 생성되는 오늘의 체크리스트에 반영됩니다.</span><button type="button" onClick={onClose}>닫기</button></footer></section></div>
}

function ChecklistMasterCreate({ form, onChange, onClose, onSubmit }) {
  return <div className="assignment-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="assignment-modal checklist-create-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><header><div><span>CHECKLIST MASTER CREATE</span><h3>점검 기준 추가</h3><p>관리자가 정기 점검 기준을 등록합니다.</p></div><button type="button" aria-label="닫기" onClick={onClose}><CloseRoundedIcon /></button></header><form className="checklist-create-form" onSubmit={onSubmit}><label className="is-wide"><span>점검 이름</span><input value={form.name} onChange={(event) => onChange('name', event.target.value)} placeholder="예: 비상구 피난 통로 점검" /></label><label><span>분류</span><select value={form.category} onChange={(event) => onChange('category', event.target.value)}><option>시설 안전</option><option>화재 예방</option><option>작업 안전</option><option>전기 안전</option></select></label><label><span>점검 주기</span><select value={form.cycle} onChange={(event) => onChange('cycle', event.target.value)}><option>매일</option><option>매주</option><option>매월</option></select></label><label className="is-wide"><span>적용 구역</span><input value={form.locations} onChange={(event) => onChange('locations', event.target.value)} placeholder="여러 구역은 쉼표(,)로 구분하세요" /></label><label><span>다음 점검일</span><input type="date" value={form.nextDate} onChange={(event) => onChange('nextDate', event.target.value)} /></label><footer><span>등록된 기준은 오늘의 체크리스트 생성 기준으로 사용됩니다.</span><div><button type="button" onClick={onClose}>취소</button><button type="submit">등록</button></div></footer></form></section></div>
}

export default ChecklistManagementPage
