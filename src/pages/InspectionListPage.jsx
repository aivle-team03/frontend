import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useMemo, useState } from 'react'
import '../styles/checklist.css'
import {
  getStoredChecklistManagementRecords,
  getStoredInspectionCatalogRecords,
  saveChecklistManagementRecords,
  saveInspectionCatalogRecords,
} from '../utils/checklistStatusStorage'

const CATEGORIES = ['소방안전', '산업안전', '시설안전', '기타']
const BASE_INSPECTION_RECORDS = [
  { id: 'INSP-001', name: '비상구 및 피난 통로 확보 점검', category: '소방안전', areas: ['본관 1층 복도', '본관 2층 복도', '별관 출입구'], cycle: '매일', content: '비상구 잠금 상태, 적치물 유무와 피난 유도등의 점등 상태를 확인합니다.' },
  { id: 'INSP-002', name: '고소 작업대 안전장치 점검', category: '산업안전', areas: ['A동 옥상', 'B동 외벽 작업구역'], cycle: '매주', content: '난간, 아웃트리거, 비상정지 장치 및 안전대 체결 상태를 확인합니다.' },
  { id: 'INSP-003', name: '전기실 배전반 이상 유무 점검', category: '시설안전', areas: ['A동 전기실', 'B동 전기실', '지하 기계실'], cycle: '매주', content: '배전반의 과열, 누전 차단기 상태, 경고 표지와 주변 정리 상태를 점검합니다.' },
  { id: 'INSP-004', name: '지게차 운행 구역 분리 점검', category: '산업안전', areas: ['물류창고', '상하차장', '완제품 보관구역'], cycle: '매일', content: '보행자 동선 분리, 제한속도 표지, 경광등 및 후진 경보장치 상태를 확인합니다.' },
  { id: 'INSP-005', name: '화학물질 보관함 및 MSDS 점검', category: '기타', areas: ['시약 보관실', '도장 작업장'], cycle: '매월', content: '용기 라벨, 누출 여부, MSDS 비치 상태와 보호구 보관 상태를 확인합니다.' },
  { id: 'INSP-006', name: '보호구 비치 및 착용 상태 점검', category: '산업안전', areas: ['조립 라인', '절삭 가공 구역', '용접 구역'], cycle: '매주', content: '안전모, 보안경, 귀마개와 방진마스크의 수량 및 훼손 여부를 확인합니다.' },
  { id: 'INSP-007', name: '비상 조명 및 유도등 점등 점검', category: '소방안전', areas: ['A동 3층 계단', 'B동 2층 복도'], cycle: '매월', content: '비상 조명과 피난 유도등의 점등 상태 및 파손 여부를 확인합니다.' },
  { id: 'INSP-008', name: '방화문 폐쇄 상태 점검', category: '소방안전', areas: ['B동 2층 복도', 'C동 출입구'], cycle: '매일', content: '방화문 자동 폐쇄 기능과 주변 적치물 유무를 확인합니다.' },
  { id: 'INSP-009', name: '환기 설비 필터 및 작동 상태 점검', category: '시설안전', areas: ['지하 기계실', '식당 조리실'], cycle: '매월', content: '환기 설비의 필터 오염도, 소음, 풍량과 작동 상태를 점검합니다.' },
  { id: 'INSP-010', name: '가스 차단 밸브 및 배관 점검', category: '시설안전', areas: ['식당 조리실', '가스 보관실'], cycle: '매주', content: '가스 차단 밸브의 작동 상태와 배관의 누출·부식 여부를 확인합니다.' },
  { id: 'INSP-011', name: '사다리 및 이동식 작업대 점검', category: '산업안전', areas: ['정비 구역', '창고 작업장'], cycle: '매주', content: '사다리 미끄럼 방지대, 작업대 난간과 바퀴 잠금장치를 확인합니다.' },
  { id: 'INSP-012', name: '비상 세안대 및 구급함 점검', category: '기타', areas: ['시약 보관실', '보건 관리실'], cycle: '매월', content: '세안대 작동 여부와 구급함의 유효기간 및 비치 수량을 확인합니다.' },
  { id: 'INSP-013', name: '소화전 함 및 호스 상태 점검', category: '소방안전', areas: ['본관 1층', '별관 1층', '물류창고'], cycle: '매월', content: '소화전 함 개방 상태, 호스·노즐의 훼손 여부와 주변 접근성을 확인합니다.' },
  { id: 'INSP-014', name: '폐기물 분리 보관 상태 점검', category: '기타', areas: ['폐기물 보관장', '도장 작업장'], cycle: '매주', content: '일반·지정 폐기물의 분리 보관, 라벨 표기 및 누출 여부를 확인합니다.' },
  { id: 'INSP-015', name: '크레인 와이어 및 훅 점검', category: '산업안전', areas: ['중량물 작업장', '상하차장'], cycle: '매일', content: '와이어 로프 마모, 훅 안전걸쇠와 정격하중 표기 상태를 확인합니다.' },
  { id: 'INSP-016', name: '누전 차단기 시험 작동 점검', category: '시설안전', areas: ['A동 전기실', 'C동 전기실'], cycle: '매월', content: '누전 차단기의 시험 버튼 작동 및 회로별 이상 유무를 확인합니다.' },
  { id: 'INSP-017', name: '화재 감지기 및 수신반 점검', category: '소방안전', areas: ['방재실', '본관 각 층'], cycle: '매주', content: '화재 감지기 오염 여부와 수신반 경보·복구 상태를 확인합니다.' },
  { id: 'INSP-018', name: '작업장 통로 및 바닥 정리 점검', category: '산업안전', areas: ['조립 라인', '포장실', '물류창고'], cycle: '매일', content: '통로 확보, 바닥 오염·미끄럼 요소와 적치물 상태를 확인합니다.' },
  { id: 'INSP-019', name: '비상 발전기 연료 및 배터리 점검', category: '시설안전', areas: ['지하 발전기실'], cycle: '매월', content: '연료 잔량, 배터리 전압과 자동 기동 상태를 확인합니다.' },
  { id: 'INSP-020', name: '위험 표지 및 안전 안내판 점검', category: '기타', areas: ['전 사업장', '출입구', '작업 구역'], cycle: '매주', content: '위험 표지와 안전 안내판의 부착 위치, 훼손 및 최신화 상태를 확인합니다.' },
]

const getRecords = () => {
  const overrides = new Map(getStoredInspectionCatalogRecords().map((record) => [record.id, record]))
  return BASE_INSPECTION_RECORDS.map((record) => {
    const merged = { ...record, ...overrides.get(record.id) }
    return merged.cycle === '작업 전' ? { ...merged, cycle: '매주' } : merged
  })
}
const areaLabel = (areas) => areas.length > 1 ? `${areas[0]} 외 ${areas.length - 1}개 구역` : areas[0]

function InspectionListPage() {
  const [catalogRecords, setCatalogRecords] = useState(getRecords)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체 카테고리')
  const [selectedId, setSelectedId] = useState(null)
  const [page, setPage] = useState(0)
  const records = useMemo(() => catalogRecords.filter((record) => (
    (category === '전체 카테고리' || record.category === category)
    && (!query.trim() || `${record.name} ${record.content} ${record.areas.join(' ')}`.includes(query.trim()))
  )), [catalogRecords, category, query])
  const pageCount = Math.max(1, Math.ceil(records.length / 10))
  const activePage = Math.min(page, pageCount - 1)
  const visibleRecords = records.slice(activePage * 10, activePage * 10 + 10)
  const selectedRecord = catalogRecords.find((record) => record.id === selectedId)

  const updateCycle = (cycle) => {
    if (!selectedRecord) return
    const next = catalogRecords.map((record) => record.id === selectedRecord.id ? { ...record, cycle } : record)
    setCatalogRecords(next)
    saveInspectionCatalogRecords(next)
    const managementRecords = getStoredChecklistManagementRecords()
    const linkedRecords = managementRecords.map((record) => (
      String(record.inspectionCatalogId ?? record.id) === String(selectedRecord.id)
        ? { ...record, cycle }
        : record
    ))
    if (linkedRecords.some((record, index) => record !== managementRecords[index])) {
      saveChecklistManagementRecords(linkedRecords)
    }
  }

  return (
    <section className="inspection-list-page">
      <article className="inspection-table-card">
        <header>
          <div><span>INSPECTION DIRECTORY</span><h3>점검 목록</h3><p>주기적으로 확인해야 할 핵심 안전 점검 항목입니다. 행을 선택하면 점검 주기를 변경할 수 있습니다.</p></div>
          <div className="inspection-filters">
            <label className="inspection-search"><SearchRoundedIcon /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="점검 이름 또는 구역 검색" /></label>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0) }}><option>전체 카테고리</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
        </header>
        <div className="inspection-table-scroll"><table className="inspection-table"><thead><tr><th>번호</th><th>점검 이름</th><th>카테고리</th><th>적용 구역</th><th>점검 주기</th><th>내용</th></tr></thead><tbody>
          {visibleRecords.map((record, index) => <tr key={record.id} onClick={() => setSelectedId(record.id)} tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && setSelectedId(record.id)}>
            <td><span className="inspection-id">{activePage * 10 + index + 1}</span></td><td><strong>{record.name}</strong></td><td><span className="inspection-category">{record.category}</span></td><td title={record.areas.join(', ')}>{areaLabel(record.areas)}</td><td><span className="inspection-cycle">{record.cycle}</span></td><td className="inspection-content-cell">{record.content}</td>
          </tr>)}
          {!records.length && <tr><td className="inspection-empty" colSpan="6">조건에 맞는 점검 항목이 없습니다.</td></tr>}
        </tbody></table></div><footer className="checklist-pagination inspection-pagination"><span>총 <strong>{records.length}</strong>건</span><div><button type="button" disabled={activePage === 0} onClick={() => setPage((current) => current - 1)}><ChevronLeftRoundedIcon /></button><b>{activePage + 1} / {pageCount}</b><button type="button" disabled={activePage === pageCount - 1} onClick={() => setPage((current) => current + 1)}><ChevronRightRoundedIcon /></button></div></footer>
      </article>

      {selectedRecord && <div className="inspection-modal-backdrop" role="presentation" onMouseDown={() => setSelectedId(null)}><section className="inspection-detail-modal" role="dialog" aria-modal="true" aria-labelledby="inspection-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>INSPECTION DETAIL</span><h3 id="inspection-detail-title">{selectedRecord.name}</h3><p>점검 기준과 적용 구역을 확인하세요.</p></div><button type="button" aria-label="상세 창 닫기" onClick={() => setSelectedId(null)}><CloseRoundedIcon /></button></header>
        <div className="inspection-detail-body"><div className="inspection-detail-meta"><div><span>카테고리</span><strong>{selectedRecord.category}</strong></div><div><span>점검 주기</span><select className="inspection-cycle-select" aria-label="점검 주기 변경" value={selectedRecord.cycle} onChange={(event) => updateCycle(event.target.value)}><option>매일</option><option>매주</option><option>매월</option></select></div><div><span>적용 구역</span><strong>{selectedRecord.areas.length}개 구역</strong></div></div><div className="inspection-detail-section"><span>점검 내용</span><p>{selectedRecord.content}</p></div><div className="inspection-detail-section"><span>적용 구역 전체</span><div className="inspection-area-chips">{selectedRecord.areas.map((area) => <b key={area}>{area}</b>)}</div></div></div>
        <footer><span>점검 주기를 변경하면 연결된 체크리스트 관리 항목에도 동일하게 반영됩니다.</span><button type="button" onClick={() => setSelectedId(null)}>닫기</button></footer>
      </section></div>}
    </section>
  )
}

export default InspectionListPage
