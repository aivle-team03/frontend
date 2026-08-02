import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Filtering from '../components/Report/Filtering.jsx'
import '../styles/report.css'

const API_BASE_URL = 'http://127.0.0.1:8000'

function mapReport(report) {
  const createdAt = String(report.created_at ?? '').slice(0, 10)
  return {
    id: report.report_id,
    title: report.summary || report.content?.split('\n')[0] || `보고서 #${report.report_id}`,
    createdAt,
    period: createdAt,
    owner: report.writer || `사용자 #${report.uid}`,
  }
}

const formatDate = (date) => date.toISOString().slice(0, 10)

const getInitialFilters = () => {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setMonth(startDate.getMonth() - 1)

  return {
    keyword: '',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    author: '',
  }
}

function ReportListPage() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState(getInitialFilters)
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? null)

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/report`, { params: { page: 1, size: 100 } })
      .then((response) => {
        const items = response.data?.items ?? []
        const mappedReports = items.map(mapReport)
        setReports(mappedReports)
        setSelectedReportId(mappedReports[0]?.id ?? null)
      })
      .catch((error) => {
        console.error('보고서 목록 조회 실패:', error)
        setReports([])
      })
  }, [])

  const filteredReports = useMemo(() => reports.filter((report) => {
    const keyword = filters.keyword.trim().toLowerCase()
    const author = filters.author.trim().toLowerCase()
    const reportDate = report.createdAt ?? ''
    const reportAuthor = report.owner ?? ''

    const matchesKeyword = !keyword || report.title.toLowerCase().includes(keyword)
    const matchesStartDate = !filters.startDate || reportDate >= filters.startDate
    const matchesEndDate = !filters.endDate || reportDate <= filters.endDate
    const matchesAuthor = !author || reportAuthor.toLowerCase().includes(author)

    return matchesKeyword
      && matchesStartDate
      && matchesEndDate
      && matchesAuthor
  }), [filters, reports])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? reports[0],
    [reports, selectedReportId],
  )

  const updateFilter = (field, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))
  }

  const resetFilters = () => {
    setFilters(getInitialFilters())
  }

  const downloadReport = (event, report) => {
    event.stopPropagation()
    console.log(`${report.title} 다운로드`)
  }

  return (
    <section className="report-page" aria-label="보고서 목록">
      <section className="report-archive-card">
        <div className="report-card-heading">
          <div>
            <span>Archive</span>
          </div>
          <strong>{filteredReports.length}건</strong>
        </div>

        <div className="report-table-wrap">
          <Filtering
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
          />

          <table className="report-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>기간</th>
                <th>작성자</th>
                <th>다운로드</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  className={selectedReport?.id === report.id ? 'is-selected' : ''}
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                >
                  <td>
                    <div className="report-title-cell">
                      <strong>{report.title}</strong>
                      <span>생성 {report.createdAt} · 보관 {report.retentionUntil}</span>
                    </div>
                  </td>
                  <td>{report.period ?? report.createdAt}</td>
                  <td>{report.owner}</td>
                  <td>
                    <button
                      className="report-download-button"
                      type="button"
                      aria-label={`${report.title} 다운로드`}
                      onClick={(event) => downloadReport(event, report)}
                    >
                      <DownloadRoundedIcon />
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredReports.length && (
                <tr>
                  <td className="report-empty-cell" colSpan={4}>조건에 맞는 보고서가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

export default ReportListPage
