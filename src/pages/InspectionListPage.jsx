import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BACKEND_API_URL } from '../config/api.js'
import '../styles/checklist.css'
import { useUiLanguage } from '../utils/uiLanguage.js'

const CATEGORIES = ['소방안전', '산업안전', '시설안전', '기타']
const areaLabel = (areas) => (areas && areas.length > 1 ? `${areas[0]} 외 ${areas.length - 1}개 구역` : (areas?.[0] || '-'))

function InspectionListPage() {
  const { language, t } = useUiLanguage()
  const [catalogRecords, setCatalogRecords] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체 카테고리')
  const [selectedId, setSelectedId] = useState(null)
  const [page, setPage] = useState(0)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)

  const loadInspections = async () => {
    try {
      setIsCatalogLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BACKEND_API_URL}/api/inspection`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const items = Array.isArray(response.data) ? response.data : []
      setCatalogRecords(items.map((item) => ({
        id: item.inspection_id,
        name: item.name,
        category: item.category || '기타',
        categoryId: item.category_id,
        areas: String(item.location || '').split(',').map((area) => area.trim()).filter(Boolean),
        cycle: item.cycle,
        content: item.content || '',
      })))
    } catch (error) {
      console.warn('정기 점검 목록을 불러오지 못했습니다.', error)
    } finally {
      setIsCatalogLoading(false)
    }
  }

  useEffect(() => {
    loadInspections()
  }, [])

  const records = useMemo(() => catalogRecords.filter((record) => (
    (category === '전체 카테고리' || record.category === category)
    && (!query.trim() || `${record.name} ${record.content} ${record.areas.join(' ')}`.includes(query.trim()))
  )), [catalogRecords, category, query])

  const pageCount = Math.max(1, Math.ceil(records.length / 10))
  const activePage = Math.min(page, pageCount - 1)
  const visibleRecords = records.slice(activePage * 10, activePage * 10 + 10)
  const selectedRecord = useMemo(
    () => catalogRecords.find((record) => record.id === selectedId) || null,
    [catalogRecords, selectedId]
  )
  const updateCycle = async (cycle) => {
    if (!selectedRecord) return
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${BACKEND_API_URL}/api/inspection/${selectedRecord.id}`, { cycle }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setCatalogRecords((current) => current.map((record) => (record.id === selectedRecord.id ? { ...record, cycle } : record)))
    } catch (error) {
      console.error('점검 주기 변경 실패:', error)
      alert('점검 주기 변경에 실패했습니다.')
    }
  }

  const handleDeleteInspection = async () => {
    if (!selectedRecord) return

    const recordName = selectedRecord.name
    const targetId = selectedRecord.id

    if (!window.confirm(`'${recordName}' 점검 항목을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${BACKEND_API_URL}/api/inspection/${targetId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      alert('점검 항목이 성공적으로 삭제되었습니다.')

      // 1. 모달 닫기
      setSelectedId(null)

      // 2. 화면 상태(State)에서 즉시 제거
      setCatalogRecords((current) => current.filter((item) => item.id !== targetId))

      // 3. 백그라운드 동기화
      try {
        await loadInspections()
      } catch (e) {
        console.warn('백그라운드 동기화 실패:', e)
      }
    } catch (error) {
      console.error('점검 항목 삭제 실패:', error)
      alert(error.response?.data?.detail || '점검 항목 삭제에 실패했습니다.')
    }
  }

  return (
    <section className={`inspection-list-page${isCatalogLoading ? ' is-data-loading' : ''}`} aria-busy={isCatalogLoading}>
      <article className="inspection-table-card">
        {/* 💡 테이블 상단 헤더 복원 */}
        <header>
          <div>
            <span>INSPECTION DIRECTORY</span>
            <h3>점검 목록</h3>
            <p>주기적으로 확인해야 할 핵심 안전 점검 항목입니다. 행을 선택하면 점검 주기를 변경하거나 삭제할 수 있습니다.</p>
          </div>
          <div className="inspection-filters">
            <label className="inspection-search">
              <SearchRoundedIcon />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="점검 이름 또는 구역 검색" />
            </label>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0) }}>
              <option>전체 카테고리</option>
              {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </header>

        <div className="inspection-table-scroll">
          <table className="inspection-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>점검 이름</th>
                <th>카테고리</th>
                <th>적용 구역</th>
                <th>점검 주기</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              {isCatalogLoading ? (
                <InspectionTableSkeletonRows />
              ) : (
                visibleRecords.map((record, index) => (
                  <tr key={record.id} onClick={() => setSelectedId(record.id)} tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && setSelectedId(record.id)}>
                    <td><span className="inspection-id">{activePage * 10 + index + 1}</span></td>
                    <td><strong>{record.name}</strong></td>
                    <td><span className="inspection-category">{record.category}</span></td>
                    <td title={record.areas.join(', ')}>{areaLabel(record.areas)}</td>
                    <td><span className="inspection-cycle">{record.cycle}</span></td>
                    <td className="inspection-content-cell">{record.content}</td>
                  </tr>
                ))
              )}
              {!isCatalogLoading && !records.length && (
                <tr><td className="inspection-empty" colSpan="6">조건에 맞는 점검 항목이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="checklist-pagination inspection-pagination">
          <span>총 <strong>{records.length}</strong>건</span>
          <div>
            <button type="button" disabled={activePage === 0} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeftRoundedIcon />
            </button>
            <b>{activePage + 1} / {pageCount}</b>
            <button type="button" disabled={activePage === pageCount - 1} onClick={() => setPage((current) => current + 1)}>
              <ChevronRightRoundedIcon />
            </button>
          </div>
        </footer>
      </article>

      {/* 💡 상세 모달 영역 */}
      {selectedRecord && (
        <div className="inspection-modal-backdrop" role="presentation" onMouseDown={() => setSelectedId(null)}>
          <section
            className="inspection-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspection-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* 깔끔하게 정돈된 모달 헤더 */}
            <header>
              <div>
                <span>INSPECTION DETAIL</span>
                <h3 id="inspection-detail-title">{selectedRecord?.name}</h3>
                <p>점검 기준과 적용 구역을 확인하세요.</p>
              </div>
              <button type="button" aria-label="상세 창 닫기" onClick={() => setSelectedId(null)}>
                <CloseRoundedIcon />
              </button>
            </header>

            <div className="inspection-detail-body">
              <div className="inspection-detail-meta">
                <div>
                  <span>카테고리</span>
                  <strong>{selectedRecord?.category}</strong>
                </div>
                <div>
                  <span>점검 주기</span>
                  <select
                    className="inspection-cycle-select"
                    aria-label="점검 주기 변경"
                    value={selectedRecord?.cycle ?? '매월'}
                    onChange={(event) => updateCycle(event.target.value)}
                  >
                    <option>매일</option>
                    <option>매주</option>
                    <option>매월</option>
                  </select>
                </div>
                <div>
                  <span>적용 구역</span>
                  <strong>{selectedRecord?.areas?.length ?? 0}개 구역</strong>
                </div>
              </div>

              <div className="inspection-detail-section">
                <span>점검 내용</span>
                <p>{selectedRecord?.content}</p>
              </div>

              <div className="inspection-detail-section">
                <span>적용 구역 전체</span>
                <div className="inspection-area-chips">
                  {selectedRecord?.areas?.map((area) => (
                    <b key={area}>{area}</b>
                  ))}
                </div>
              </div>

              <div className="inspection-detail-section">
                <span>구역별 마지막 점검 이력</span>
                <div className="area-history-list">
                  <p>점검 이력은 이력 관리 화면에서 확인할 수 있습니다.</p>
                </div>
              </div>
            </div>

            {/* 💡 깔끔한 푸터 버튼 정렬 */}
            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                점검 주기를 변경하면 연결된 체크리스트 관리 항목에도 동일하게 반영됩니다.
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleDeleteInspection}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #fca5a5',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2'
                    e.currentTarget.style.borderColor = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2'
                    e.currentTarget.style.borderColor = '#fca5a5'
                  }}
                >
                  <DeleteOutlineRoundedIcon style={{ fontSize: '17px' }} />
                  삭제
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  닫기
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </section>
  )
}

function InspectionTableSkeletonRows() {
  return Array.from({ length: 8 }, (_, rowIndex) => (
    <tr className="table-skeleton-row" key={rowIndex}>
      {Array.from({ length: 6 }, (_, columnIndex) => (
        <td key={columnIndex}>
          <span className={`table-skeleton-block column-${columnIndex}`} />
        </td>
      ))}
    </tr>
  ))
}

export default InspectionListPage
