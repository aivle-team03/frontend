import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { renderAsync } from 'docx-preview'
import Filtering from '../components/Report/Filtering.jsx'
import { BACKEND_API_URL } from '../config/api.js'
import '../styles/report.css'

const REPORT_TYPE_OPTIONS = [
  { key: 'risk-assessment-form', label: '위험성평가표' },
  { key: 'risk-assessment-report', label: '위험성평가 보고서' },
  { key: 'management-order-report', label: '경영책임자 검토지시서' },
  { key: 'worker-risk-report', label: '종사자에 의한 유해 위험요인 보고서' },
]

const REPORTS_PER_PAGE = 10

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
  return {
    keyword: '',
    startDate: '',
    endDate: '',
    author: '',
  }
}

const getReportDateRangeFilters = (reports) => {
  const reportDates = reports
    .map((report) => report.createdAt)
    .filter(Boolean)
    .sort()

  return {
    keyword: '',
    startDate: reportDates[0] ?? '',
    endDate: reportDates.at(-1) ?? '',
    author: '',
  }
}

const fetchReportFileUrl = async (reportId, signal) => {
  const response = await axios.get(`${BACKEND_API_URL}/api/report/${reportId}/file-url`, { signal })
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
  const [creatorName, setCreatorName] = useState('')
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [currentReportPage, setCurrentReportPage] = useState(1)
  const didSetInitialDateRangeRef = useRef(false)
  const [reportForm, setReportForm] = useState({
    type: 'risk-assessment-form',
    startDate: '2026-07-21',
    endDate: formatDate(new Date()),
  })

  const loadReports = () => {
    return axios.get(`${BACKEND_API_URL}/api/report`, { params: { page: 1, size: 100 } })
      .then((response) => {
        const items = response.data?.items ?? []
        const mappedReports = items.map(mapReport)
        setReports(mappedReports)

        if (!didSetInitialDateRangeRef.current) {
          setFilters(getReportDateRangeFilters(mappedReports))
          didSetInitialDateRangeRef.current = true
        }
      })
      .catch((error) => {
        console.error('보고서 목록 조회 실패:', error)
        setReports([])
      })
  }

  useEffect(() => {
    loadReports()
  }, [])

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.get(`${BACKEND_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = response.data

        setCreatorName(userData?.name || userData?.user_id || '관리자')
      } catch (error) {
        console.error('보고서 생성자 정보 조회 실패:', error)
        setCreatorName('관리자')
      }
    }

    fetchCreatorProfile()
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

  const reportPageCount = Math.max(1, Math.ceil(filteredReports.length / REPORTS_PER_PAGE))
  const visibleReports = useMemo(() => {
    const pageStartIndex = (currentReportPage - 1) * REPORTS_PER_PAGE
    return filteredReports.slice(pageStartIndex, pageStartIndex + REPORTS_PER_PAGE)
  }, [currentReportPage, filteredReports])

  useEffect(() => {
    setCurrentReportPage(1)
  }, [filters])

  useEffect(() => {
    setCurrentReportPage((currentPage) => Math.min(currentPage, reportPageCount))
  }, [reportPageCount])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  )

  const selectedTypeOption = useMemo(
    () => REPORT_TYPE_OPTIONS.find((item) => item.key === reportForm.type),
    [reportForm.type],
  )
  const isRiskAssessmentForm = reportForm.type === 'risk-assessment-form'
  const isManagementOrderReport = reportForm.type === 'management-order-report'
  const isWorkerRiskReport = reportForm.type === 'worker-risk-report'
  const isRiskAssessmentReport = reportForm.type === 'risk-assessment-report'
  const isPeriodDisabled = isRiskAssessmentForm || isWorkerRiskReport

  const updateFilter = (field, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))
  }

  const updateReportForm = (field, value) => {
    setReportForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const resetFilters = () => {
    setFilters(getReportDateRangeFilters(reports))
  }

  const moveReportPage = (nextPage) => {
    setCurrentReportPage(Math.min(Math.max(nextPage, 1), reportPageCount))
  }

  const openReportPreview = (report) => {
    setSelectedReportId(report.id)
  }

  const createReport = async () => {
    if (isCreatingReport) return

    setIsCreatingReport(true)

    try {
      if (isRiskAssessmentForm) {
        await axios.post(`${BACKEND_API_URL}/api/report/risk-assessment/form/generate`)
      } else if (isManagementOrderReport) {
        await axios.post(`${BACKEND_API_URL}/api/report/management-review-order/generate`, null, {
          params: {
            start_date: reportForm.startDate,
            end_date: reportForm.endDate,
          },
        })
      } else if (isWorkerRiskReport) {
        await axios.post(`${BACKEND_API_URL}/api/report/worker-feedback/generate`)
      } else if (isRiskAssessmentReport) {
        await axios.post(`${BACKEND_API_URL}/api/report/risk-assessment/report/generate`, null, {
          params: {
            start_date: reportForm.startDate,
            end_date: reportForm.endDate,
          },
        })
      }

      await loadReports()
    } catch (error) {
      console.error('보고서 생성 실패:', error)
    } finally {
      setIsCreatingReport(false)
    }
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
    <section className="report-page" aria-label="보고서">
      <section className="report-basic-card">
        <div className="report-card-heading compact">
          <div>
            <span>Report</span>
            <h2>보고서 생성</h2>
            <p className="report-heading-description">위험성평가표는 매일 자동으로 생성됩니다.</p>
          </div>
        </div>

        <div className="report-basic-grid">
          <label className="report-field">
            <span>보고서 유형 <em>*</em></span>
            <select value={reportForm.type} onChange={(event) => updateReportForm('type', event.target.value)}>
              {REPORT_TYPE_OPTIONS.map((type) => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>
          </label>

          <div className={`report-field${isPeriodDisabled ? ' is-disabled' : ''}`}>
            <span>작성 기간 <em>*</em></span>
            <div className="report-range-field">
              <input
                aria-label="시작일"
                type="date"
                value={reportForm.startDate}
                disabled={isPeriodDisabled}
                onChange={(event) => updateReportForm('startDate', event.target.value)}
              />
              <b>~</b>
              <input
                aria-label="종료일"
                type="date"
                value={reportForm.endDate}
                disabled={isPeriodDisabled}
                onChange={(event) => updateReportForm('endDate', event.target.value)}
              />
            </div>
          </div>

          <label className="report-field">
            <span>생성자</span>
            <input
              type="text"
              value=""
              placeholder={creatorName || '계정 정보를 불러오는 중입니다'}
              disabled
              readOnly
            />
          </label>
        </div>

        <div className="report-form-action">
          <p className="report-form-note">보고서 생성에는 약 1~10분이 소요될 수 있습니다.</p>
          <button
            className="report-create-button"
            type="button"
            onClick={createReport}
            disabled={isCreatingReport}
          >
            <DescriptionOutlinedIcon /> {isCreatingReport ? '생성 중...' : '리포트 생성'}
          </button>
        </div>
      </section>

      <div className="report-list-workspace">
        <section className="report-archive-card">
          <div className="report-card-heading">
            <div>
              <span>Archive</span>
              <h2>보고서 목록</h2>
              <p className="report-heading-description">보고서 항목을 선택하면 문서 미리보기를 확인할 수 있습니다.</p>
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
                {visibleReports.map((report) => (
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

          <div className="report-pagination" aria-label="보고서 목록 페이지 이동">
            <span>페이지 {currentReportPage} / {reportPageCount}</span>
            <div>
              <button type="button" disabled={currentReportPage === 1} onClick={() => moveReportPage(currentReportPage - 1)}>
                이전
              </button>
              <button type="button" disabled={currentReportPage === reportPageCount} onClick={() => moveReportPage(currentReportPage + 1)}>
                다음
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ReportListPage
