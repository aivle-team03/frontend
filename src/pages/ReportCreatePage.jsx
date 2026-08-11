import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ReportPreview from '../components/Report/ReportPreview.jsx'
import { REPORT_PAGE_MOCK_DATA } from '../mocks/mockData.js'
import { loadGeneratedReports, saveGeneratedReport } from '../utils/reportArchiveStorage.js'
import { BACKEND_API_URL } from '../config/api.js'
import '../styles/report.css'

const REPORT_TYPE_OPTIONS = [
  { key: 'risk-assessment-form', label: '위험성평가표' },
  { key: 'risk-assessment-report', label: '위험성평가 보고서' },
  { key: 'management-order-report', label: '경영책임자 검토지시서' },
  { key: 'worker-risk-report', label: '종사자에 의한 유해 위험요인 보고서' },
]

function ReportCreatePage() {
  const navigate = useNavigate()
  const [creatorName, setCreatorName] = useState('')
  const [reportForm, setReportForm] = useState({
    type: 'risk-assessment-form',
    startDate: '2026-07-21',
    endDate: '2026-07-21',
    customTitle: '',
    incidentOverview: '',
  })

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

  const selectedPeriodLabel = useMemo(() => {
    if (reportForm.startDate === reportForm.endDate) return reportForm.startDate
    return `${reportForm.startDate} ~ ${reportForm.endDate}`
  }, [reportForm.endDate, reportForm.startDate])

  const selectedTypeOption = useMemo(
    () => REPORT_TYPE_OPTIONS.find((item) => item.key === reportForm.type),
    [reportForm.type],
  )
  const isRiskAssessmentForm = reportForm.type === 'risk-assessment-form'
  const isManagementOrderReport = reportForm.type === 'management-order-report'
  const isWorkerRiskReport = reportForm.type === 'worker-risk-report'
  const isRiskAssessmentReport = reportForm.type === 'risk-assessment-report'
  const isPeriodDisabled = isRiskAssessmentForm || isWorkerRiskReport

  const previewTitle = useMemo(() => {
    if (reportForm.type === 'etc' && reportForm.customTitle.trim()) {
      return reportForm.customTitle.trim()
    }

    return `${selectedPeriodLabel} ${selectedTypeOption?.label ?? '보고서'}`
  }, [reportForm.customTitle, reportForm.type, selectedPeriodLabel, selectedTypeOption?.label])

  const updateReportForm = (field, value) => {
    setReportForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const createReport = async () => {
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
    } else if ( isRiskAssessmentReport)  
        await axios.post(`${BACKEND_API_URL}/api/report/risk-assessment/report/generate`, null, {
        params: {
          start_date: reportForm.startDate,
          end_date: reportForm.endDate,
        },
      })


    const isEtcReport = reportForm.type === 'etc'
    const isIncidentReport = reportForm.type === 'incident-investigation'
    const reportTitle = isEtcReport && reportForm.customTitle.trim()
      ? reportForm.customTitle.trim()
      : `${selectedPeriodLabel} ${selectedTypeOption?.label ?? '보고서'}`
    const allReports = [...loadGeneratedReports(), ...REPORT_PAGE_MOCK_DATA.reports]
    const nextId = Math.max(...allReports.map((report) => report.id), 0) + 1
    const today = new Date().toISOString().slice(0, 10)

    saveGeneratedReport({
      id: nextId,
      title: reportTitle,
      type: selectedTypeOption?.label ?? '리포트',
      createdAt: today,
      period: selectedPeriodLabel,
      owner: creatorName || '관리자',
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
              {REPORT_TYPE_OPTIONS.map((type) => (
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

      <ReportPreview
        title={previewTitle}
        type={selectedTypeOption?.label ?? '보고서'}
        period={selectedPeriodLabel}
        author={creatorName}
        overview={reportForm.type === 'incident-investigation' ? reportForm.incidentOverview : ''}
      />
    </section>
  )
}

export default ReportCreatePage
