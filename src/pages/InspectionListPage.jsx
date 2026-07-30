import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import '../styles/checklist.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api/inspection'

const CATEGORIES = ['소방안전', '산업안전', '시설안전', '기타']

const areaLabel = (areas) => {
  if (!areas || areas.length === 0) return '-'
  return areas.length > 1 ? `${areas[0]} 외 ${areas.length - 1}개 구역` : areas[0]
}

function InspectionListPage() {
  const [catalogRecords, setCatalogRecords] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체 카테고리')
  const [selectedId, setSelectedId] = useState(null)
  const [page, setPage] = useState(0)

  const fetchInspections = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      let rawList = []
      if (Array.isArray(response.data)) {
        rawList = response.data
      } else if (Array.isArray(response.data?.items)) {
        rawList = response.data.items
      } else if (Array.isArray(response.data?.data)) {
        rawList = response.data.data
      } else {
        console.warn('API 응답이 배열 형태가 아닙니다:', response.data)
      }

      const formattedData = response.data.map((item) => {
        const rawLocations = item.location ? item.location.split(',') : []
        const parsedAreas = rawLocations.map((loc) => loc.trim()).filter(Boolean)

        return {
          id: item.inspection_id,
          name: item.name,
          category: item.category || item.category_name || '기타',
          areas: parsedAreas.length > 0 ? parsedAreas : ['구역 미지정'],
          cycle: item.cycle,
          content: item.content || '등록된 내용이 없습니다.',
        }
      })

      setCatalogRecords(formattedData)
    } catch (error) {
      console.error('점검 목록을 불러오는데 실패했습니다:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInspections()
  }, [])


  const records = useMemo(() => {
    return catalogRecords.filter((record) => {
      const isCategoryMatch = category === '전체 카테고리' || record.category === category
      const isQueryMatch =
        !query.trim() ||
        `${record.name} ${record.content} ${record.areas.join(' ')}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())

      return isCategoryMatch && isQueryMatch
    })
  }, [catalogRecords, category, query])

  const pageCount = Math.max(1, Math.ceil(records.length / 10))
  const activePage = Math.min(page, pageCount - 1)
  const visibleRecords = records.slice(activePage * 10, activePage * 10 + 10)
  const selectedRecord = catalogRecords.find((record) => record.id === selectedId)

  const updateCycle = async (newCycle) => {
    if (!selectedRecord) return

    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API_BASE_URL}/${selectedRecord.id}`,
        { cycle: newCycle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setCatalogRecords((prev) =>
        prev.map((record) =>
          record.id === selectedRecord.id ? { ...record, cycle: newCycle } : record
        )
      )
    } catch (error) {
      console.error('점검 주기 변경에 실패했습니다:', error)
      alert('점검 주기 변경 중 오류가 발생했습니다.')
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
              {isLoading ? (
                <tr>
                  <td className="inspection-empty" colSpan="6">
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : visibleRecords.length > 0 ? (
                visibleRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedId(record.id)}
                    tabIndex="0"
                    onKeyDown={(event) => event.key === 'Enter' && setSelectedId(record.id)}
                  >
                    <td>
                      <span className="inspection-id">{activePage * 10 + index + 1}</span>
                    </td>
                    <td>
                      <strong>{record.name}</strong>
                    </td>
                    <td>
                      <span className="inspection-category">{record.category}</span>
                    </td>
                    <td title={record.areas.join(', ')}>{areaLabel(record.areas)}</td>
                    <td>
                      <span className="inspection-cycle">{record.cycle}</span>
                    </td>
                    <td className="inspection-content-cell">{record.content}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="inspection-empty" colSpan="6">
                    조건에 맞는 점검 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="checklist-pagination inspection-pagination">
          <span>
            총 <strong>{records.length}</strong>건
          </span>
          <div>
            <button
              type="button"
              disabled={activePage === 0}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeftRoundedIcon />
            </button>
            <b>
              {activePage + 1} / {pageCount}
            </b>
            <button
              type="button"
              disabled={activePage === pageCount - 1}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRightRoundedIcon />
            </button>
          </div>
        </footer>
      </article>

      {selectedRecord && (
        <div className="inspection-modal-backdrop" role="presentation" onMouseDown={() => setSelectedId(null)}>
          <section
            className="inspection-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inspection-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>INSPECTION DETAIL</span>
                <h3 id="inspection-detail-title">{selectedRecord.name}</h3>
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
                  <strong>{selectedRecord.category}</strong>
                </div>
                <div>
                  <span>점검 주기</span>
                  <select
                    className="inspection-cycle-select"
                    aria-label="점검 주기 변경"
                    value={selectedRecord.cycle}
                    onChange={(event) => updateCycle(event.target.value)}
                  >
                    <option>매일</option>
                    <option>매주</option>
                    <option>매월</option>
                  </select>
                </div>
                <div>
                  <span>적용 구역</span>
                  <strong>{selectedRecord.areas.length}개 구역</strong>
                </div>
              </div>
              <div className="inspection-detail-section">
                <span>점검 내용</span>
                <p>{selectedRecord.content}</p>
              </div>
              <div className="inspection-detail-section">
                <span>적용 구역 전체</span>
                <div className="inspection-area-chips">
                  {selectedRecord.areas.map((area) => (
                    <b key={area}>{area}</b>
                  ))}
                </div>
              </div>
            </div>
            <footer>
              <span>점검 주기를 변경하면 DB에 즉시 반영됩니다.</span>
              <button type="button" onClick={() => setSelectedId(null)}>
                닫기
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  )
}

export default InspectionListPage
