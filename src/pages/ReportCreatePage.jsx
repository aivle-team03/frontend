import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { REPORT_PAGE_MOCK_DATA } from '../mocks/mockData.js'
import { loadGeneratedReports, saveGeneratedReport } from '../utils/reportArchiveStorage.js'
import '../styles/report.css'

function ReportCreatePage() {
  const navigate = useNavigate()
  const [reportForm, setReportForm] = useState({
    type: 'risk-assessment',
    startDate: '2026-07-21',
    endDate: '2026-07-21',
    customTitle: '',
    incidentOverview: '',
    author: '김태니지 (안전책임자)',
  })

  const selectedPeriodLabel = useMemo(() => {
    if (reportForm.startDate === reportForm.endDate) return reportForm.startDate
    return `${reportForm.startDate} ~ ${reportForm.endDate}`
  }, [reportForm.endDate, reportForm.startDate])

  const updateReportForm = (field, value) => {
    setReportForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const createReport = () => {
    const typeOption = REPORT_PAGE_MOCK_DATA.reportTypes.find((item) => item.key === reportForm.type)
    const isEtcReport = reportForm.type === 'etc'
    const isIncidentReport = reportForm.type === 'incident-investigation'
    const reportTitle = isEtcReport && reportForm.customTitle.trim()
      ? reportForm.customTitle.trim()
      : `${selectedPeriodLabel} ${typeOption?.label ?? '보고서'}`
    const allReports = [...loadGeneratedReports(), ...REPORT_PAGE_MOCK_DATA.reports]
    const nextId = Math.max(...allReports.map((report) => report.id), 0) + 1
    const today = new Date().toISOString().slice(0, 10)

    saveGeneratedReport({
      id: nextId,
      title: reportTitle,
      type: typeOption?.label ?? '리포트',
      createdAt: today,
      period: selectedPeriodLabel,
      owner: reportForm.author,
      attachments: 1,
      retentionUntil: '2026-10-21',
      retentionStatus: 'normal',
      overview: isIncidentReport ? reportForm.incidentOverview.trim() : '',
    })
    navigate('/report/list')
  }

  return (
    <section className="report-page" aria-label="보고서 생성">
      <section className="report-basic-card">
        <div className="report-card-heading compact">
          <div>
            <span>Report</span>
            <h2>보고서 생성</h2>
          </div>
        </div>

        <div className="report-basic-grid">
          <label className="report-field">
            <span>보고서 유형 <em>*</em></span>
            <select value={reportForm.type} onChange={(event) => updateReportForm('type', event.target.value)}>
              {REPORT_PAGE_MOCK_DATA.reportTypes.map((type) => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>
          </label>

          {reportForm.type === 'etc' && (
            <label className="report-field">
              <span>보고서 이름 <em>*</em></span>
              <input
                type="text"
                value={reportForm.customTitle}
                placeholder="보고서 이름을 입력하세요"
                onChange={(event) => updateReportForm('customTitle', event.target.value)}
              />
            </label>
          )}

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
            <span>작성자 <em>*</em></span>
            <input
              type="text"
              value={reportForm.author}
              placeholder="작성자를 입력하세요"
              onChange={(event) => updateReportForm('author', event.target.value)}
            />
          </label>

          {reportForm.type === 'incident-investigation' && (
            <label className="report-field report-overview-field">
              <span>사고 개요 <em>*</em></span>
              <textarea
                value={reportForm.incidentOverview}
                placeholder="사고 발생 경위, 피해 현황, 초기 조치 내용을 입력하세요"
                onChange={(event) => updateReportForm('incidentOverview', event.target.value)}
              />
            </label>
          )}

        </div>

        <div className="report-form-action">
          <button className="report-create-button" type="button" onClick={createReport}>
            <DescriptionOutlinedIcon /> 리포트 생성
          </button>
        </div>
      </section>
    </section>
  )
}

export default ReportCreatePage
