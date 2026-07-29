import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
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
  const records = useMemo(() => catalogRecords.filter((record) => (
    (category === '전체 카테고리' || record.category === category)
    && (!query.trim() || `${record.name} ${record.content} ${record.areas.join(' ')}`.includes(query.trim()))
  )), [catalogRecords, category, query])
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
            <label className="inspection-search"><SearchRoundedIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="점검 이름 또는 구역 검색" /></label>
            <select value={category} onChange={(event) => setCategory(event.target.value)}><option>전체 카테고리</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
        </header>
        <div className="inspection-table-scroll"><table className="inspection-table"><thead><tr><th>번호</th><th>점검 이름</th><th>카테고리</th><th>적용 구역</th><th>점검 주기</th><th>내용</th></tr></thead><tbody>
          {records.map((record, index) => <tr key={record.id} onClick={() => setSelectedId(record.id)} tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && setSelectedId(record.id)}>
            <td><span className="inspection-id">{index + 1}</span></td><td><strong>{record.name}</strong></td><td><span className="inspection-category">{record.category}</span></td><td title={record.areas.join(', ')}>{areaLabel(record.areas)}</td><td><span className="inspection-cycle">{record.cycle}</span></td><td className="inspection-content-cell">{record.content}</td>
          </tr>)}
          {!records.length && <tr><td className="inspection-empty" colSpan="6">조건에 맞는 점검 항목이 없습니다.</td></tr>}
        </tbody></table></div>
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
