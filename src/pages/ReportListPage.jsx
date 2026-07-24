import { useMemo, useState } from 'react'
import Filtering from '../components/Report/Filtering.jsx'
import { REPORT_PAGE_MOCK_DATA } from '../mocks/mockData.js'
import { loadGeneratedReports } from '../utils/reportArchiveStorage.js'
import '../styles/report.css'

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
  const [reports] = useState(() => [...loadGeneratedReports(), ...REPORT_PAGE_MOCK_DATA.reports])
  const [filters, setFilters] = useState(getInitialFilters)
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? null)

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
                </tr>
              ))}
              {!filteredReports.length && (
                <tr>
                  <td className="report-empty-cell" colSpan={3}>조건에 맞는 보고서가 없습니다.</td>
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
