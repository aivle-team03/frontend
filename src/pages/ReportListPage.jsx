import { useMemo, useState, useEffect } from 'react'
import axios from 'axios'
import Filtering from '../components/Report/Filtering.jsx'
import { loadGeneratedReports } from '../utils/reportArchiveStorage.js'
import '../styles/report.css'

const API_BASE_URL = 'http://127.0.0.1:8000'

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
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(getInitialFilters)
  const [selectedReportId, setSelectedReportId] = useState(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const params = {
        page: 1,
        size: 50,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        writer: filters.author.trim() || undefined,
        keyword: filters.keyword.trim() || undefined,
      }

      const response = await axios.get(`${API_BASE_URL}/api/report`, { headers, params })

      if (response.data && response.data.items) {
        const formattedReports = response.data.items.map((item) => {
          const createdAtStr = item.created_at ? String(item.created_at).slice(0, 10) : '-'
          return {
            id: item.report_id,
            title: item.title || `안전 보고서 #${item.report_id}`,
            createdAt: createdAtStr,
            retentionUntil: item.retention_until || '-',
            period: item.period || createdAtStr,

            // 백엔드 get_reports에서 넘겨준 작성자 이름(writer)을 바인딩!
            owner: item.writer || item.user?.name || '작성자 미상',

            content: item.content || '',
            summary: item.summary || '',
          }
        })

        setReports(formattedReports)

        if (formattedReports.length > 0) {
          setSelectedReportId((prev) => (formattedReports.some((r) => r.id === prev) ? prev : formattedReports[0].id))
        } else {
          setSelectedReportId(null)
        }
      }
    } catch (error) {
      console.error('보고서 목록 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [filters])

  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]

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
          <strong>{reports.length}건</strong>
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
              {loading ? (
                <tr>
                  <td className="report-empty-cell" colSpan={3}>데이터를 불러오는 중입니다...</td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((report) => (
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
                ))
              ) : (
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
