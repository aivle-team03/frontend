import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { renderAsync } from 'docx-preview'
import Filtering from '../components/Report/Filtering.jsx'
import { BACKEND_API_URL } from '../config/api.js'
import '../styles/report.css'

function mapReport(report) {
  const createdAt = String(report.created_at ?? '').slice(0, 10)

  return {
    id: report.report_id,
    title: report.title || `보고서 #${report.report_id}`,
    createdAt,
    period: createdAt,
    owner: report.writer || `사용자 #${report.uid}`,
    retentionUntil: report.retention_until ? String(report.retention_until).slice(0, 10) : '-',
  }
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

const fetchReportFileUrl = async (reportId, signal) => {
  const response = await axios.get(`${BACKEND_API_URL}/api/report/${reportId}/file-url/`, { signal })
  return response.data?.file_url ?? ''
}

function DocxPreview({ report }) {
  const containerRef = useRef(null)
  const [renderState, setRenderState] = useState('idle')
  const [docxUrl, setDocxUrl] = useState('')
  const status = renderState === 'loading' || renderState === 'error'
    ? renderState
    : docxUrl ? renderState : 'empty'

  useEffect(() => {
    if (!report?.id) {
      setDocxUrl('')
      return undefined
    }

    const controller = new AbortController()
    setRenderState('loading')
    setDocxUrl('')

    fetchReportFileUrl(report.id, controller.signal)
      .then((nextDocxUrl) => setDocxUrl(nextDocxUrl))
      .catch((error) => {
        if (axios.isCancel(error) || error.name === 'CanceledError') return
        console.error('보고서 파일 URL 조회 실패:', error)
        setRenderState('error')
      })

    return () => controller.abort()
  }, [report?.id])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    container.innerHTML = ''

    if (!docxUrl) return undefined

    const controller = new AbortController()
    Promise.resolve().then(() => setRenderState('loading'))

    fetch(docxUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('문서 파일을 불러오지 못했습니다.')
        return response.arrayBuffer()
      })
      .then((buffer) => renderAsync(buffer, container, null, {
        className: 'report-docx',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: true,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
        experimental: true,
      }))
      .then(() => setRenderState('ready'))
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('보고서 미리보기 실패:', error)
        container.innerHTML = ''
        setRenderState('error')
      })

    return () => {
      controller.abort()
      container.innerHTML = ''
    }
  }, [docxUrl])

  const openDocument = () => {
    if (docxUrl) {
      window.open(docxUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <section className="report-docx-preview-card report-docx-preview-full" aria-label="보고서 문서 미리보기">
      <div className="report-card-heading">
        <div className="report-heading-title">
          <div>
            <span>Preview</span>
            <h2>{report?.title ?? '보고서 미리보기'}</h2>
          </div>
          <small>생성 {report?.createdAt ?? '-'}</small>
        </div>
        <button
          className="report-preview-download"
          type="button"
          onClick={openDocument}
          disabled={!docxUrl}
        >
          <DownloadRoundedIcon />
          다운로드
        </button>
      </div>

      <div className="report-docx-preview-body">
        {status === 'loading' && <p className="report-docx-message">문서를 불러오는 중입니다.</p>}
        {status === 'empty' && <p className="report-docx-message">이 보고서에는 연결된 Word 파일이 없습니다.</p>}
        {status === 'error' && <p className="report-docx-message">Word 파일 미리보기를 표시하지 못했습니다.</p>}
        <div className="report-docx-renderer" ref={containerRef} />
      </div>
    </section>
  )
}

function ReportListPage() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState(getInitialFilters)
  const [selectedReportId, setSelectedReportId] = useState(null)

  useEffect(() => {
    axios.get(`${BACKEND_API_URL}/api/report`, { params: { page: 1, size: 100 } })
      .then((response) => {
        const items = response.data?.items ?? []
        setReports(items.map(mapReport))
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
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  )

  const updateFilter = (field, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))
  }

  const resetFilters = () => {
    setFilters(getInitialFilters())
  }

  const openReportPreview = (report) => {
    setSelectedReportId(report.id)
  }

  const downloadReport = async (event, report) => {
    event.stopPropagation()

    try {
      const docxUrl = await fetchReportFileUrl(report.id)
      if (docxUrl) {
        window.open(docxUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('보고서 다운로드 URL 조회 실패:', error)
    }
  }

  if (selectedReport) {
    return (
      <section className="report-page report-preview-page" aria-label="보고서 미리보기">
        <button className="report-preview-back" type="button" onClick={() => setSelectedReportId(null)}>
          <ArrowBackRoundedIcon />
          목록으로
        </button>
        <DocxPreview report={selectedReport} />
      </section>
    )
  }

  return (
    <section className="report-page" aria-label="보고서 목록">
      <div className="report-list-workspace">
        <section className="report-archive-card">
          <div className="report-card-heading">
            <div>
              <span>Archive</span>
              <h2>보고서 목록</h2>
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
                  <th>생성자</th>
                  <th>다운로드</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => openReportPreview(report)}
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
      </div>
    </section>
  )
}

export default ReportListPage
