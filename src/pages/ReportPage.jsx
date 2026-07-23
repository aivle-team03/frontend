import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { useMemo, useState } from 'react'
import { REPORT_PAGE_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/report.css'

function ReportPage() {
  const [reports, setReports] = useState(REPORT_PAGE_MOCK_DATA.reports)
  const [reportForm, setReportForm] = useState({
    title: '',
    type: 'daily',
    startDate: '2026-07-21',
    endDate: '2026-07-21',
    site: '',
    author: '김태니지 (안전책임자)',
    submitTarget: '안전보건관리팀장',
  })
  const [selectedReportId, setSelectedReportId] = useState(REPORT_PAGE_MOCK_DATA.reports[0]?.id ?? null)

  const selectedPeriodLabel = useMemo(() => {
    if (reportForm.startDate === reportForm.endDate) return reportForm.startDate
    return `${reportForm.startDate} ~ ${reportForm.endDate}`
  }, [reportForm.endDate, reportForm.startDate])

  const filteredReports = useMemo(() => {
    const endDate = new Date(`${reportForm.endDate}T23:59:59`)
    const startDate = new Date(`${reportForm.startDate}T00:00:00`)

    return reports.filter((report) => {
      const createdAt = new Date(`${report.createdAt}T12:00:00`)
      return createdAt >= startDate && createdAt <= endDate
    })
  }, [reportForm.endDate, reportForm.startDate, reports])

  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0]

  const updateReportForm = (field, value) => {
    setReportForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const createReport = () => {
    const typeOption = REPORT_PAGE_MOCK_DATA.reportTypes.find((item) => item.key === reportForm.type)
    const nextId = Math.max(...reports.map((report) => report.id), 0) + 1
    const nextReport = {
      id: nextId,
      title: reportForm.title.trim() || `${selectedPeriodLabel} ${typeOption?.label ?? '보고서'}`,
      type: typeOption?.label ?? '리포트',
      createdAt: '2026-07-21',
      owner: reportForm.author,
      attachments: 1,
      retentionUntil: '2026-10-21',
      retentionStatus: 'normal',
      dataPolicy: reportForm.site || '전체 사업장',
    }

    setReports((currentReports) => [nextReport, ...currentReports])
    setSelectedReportId(nextId)
  }

  return (
    <section className="report-page" aria-label="보고서 아카이빙">
      <section className="report-basic-card">
        <div className="report-card-heading compact">
          <div>
            <span>Report</span>
            <h2>보고서 기본 정보</h2>
          </div>
        </div>

        <div className="report-basic-grid">
          <label className="report-field wide">
            <span>보고서 제목 <em>*</em></span>
            <input
              type="text"
              value={reportForm.title}
              onChange={(event) => updateReportForm('title', event.target.value)}
              placeholder="보고서 제목을 입력하세요"
            />
          </label>

          <div className="report-field">
            <span>보고서 유형 <em>*</em></span>
            <div className="report-type-toggle" role="group" aria-label="보고서 유형">
              {REPORT_PAGE_MOCK_DATA.reportTypes.map((type) => (
                <button
                  className={reportForm.type === type.key ? 'is-active' : ''}
                  type="button"
                  key={type.key}
                  onClick={() => updateReportForm('type', type.key)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="report-field">
            <span>작성 기간 <em>*</em></span>
            <div className="report-range-field">
              <input
                aria-label="시작일"
                type="date"
                value={reportForm.startDate}
                onChange={(event) => updateReportForm('startDate', event.target.value)}
              />
              <b>~</b>
              <input
                aria-label="종료일"
                type="date"
                value={reportForm.endDate}
                onChange={(event) => updateReportForm('endDate', event.target.value)}
              />
            </div>
          </div>

          <label className="report-field">
            <span>대상 사업장 / 구역 <em>*</em></span>
            <select value={reportForm.site} onChange={(event) => updateReportForm('site', event.target.value)}>
              <option value="">사업장 또는 구역을 선택하세요</option>
              {REPORT_PAGE_MOCK_DATA.siteOptions.map((site) => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>
          </label>

          <label className="report-field">
            <span>작성자 <em>*</em></span>
            <select value={reportForm.author} onChange={(event) => updateReportForm('author', event.target.value)}>
              {REPORT_PAGE_MOCK_DATA.authorOptions.map((author) => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </label>

          <label className="report-field">
            <span>제출 대상 <em>*</em></span>
            <select value={reportForm.submitTarget} onChange={(event) => updateReportForm('submitTarget', event.target.value)}>
              {REPORT_PAGE_MOCK_DATA.submitTargets.map((target) => (
                <option key={target} value={target}>{target}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="report-workspace">
        <section className="report-archive-card">
          <div className="report-card-heading">
            <div>
              <span>Archive</span>
              <div className="report-heading-title">
                <h2>보고서 목록</h2>
                <small>일일, 주간, 월간 보고서는 자동생성됩니다.</small>
              </div>
            </div>
            <strong>{filteredReports.length}건</strong>
          </div>

          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>유형</th>
                  <th>생성일자</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    className={selectedReport?.id === report.id ? 'is-selected' : ''}
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    <td>{report.id}</td>
                    <td>
                      <div className="report-title-cell">
                        <strong>{report.title}</strong>
                        <span>{report.dataPolicy} · 보관 {report.retentionUntil}</span>
                      </div>
                    </td>
                    <td><span className="report-type-badge">{report.type}</span></td>
                    <td>{report.createdAt}</td>
                    <td>
                      <div className="report-row-actions">
                        <button type="button" aria-label={`${report.title} 수정`} onClick={(event) => event.stopPropagation()}>
                          <EditRoundedIcon />
                        </button>
                        <button type="button" aria-label={`${report.title} 다운로드`} onClick={(event) => event.stopPropagation()}>
                          <DownloadRoundedIcon />
                        </button>
                        <ChevronRightRoundedIcon />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="report-control-panel">
          <section className="report-panel-section">
            <span className="report-panel-eyebrow">Generate</span>
            <h2>리포트 생성</h2>
            <p className="report-generate-copy">{selectedPeriodLabel} 기준으로 보고서를 생성합니다.</p>
            <button className="report-create-button" type="button" onClick={createReport}>
              <DescriptionOutlinedIcon /> 리포트 생성
            </button>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default ReportPage
