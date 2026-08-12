import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AiSummaryCard from '../components/dashboard/AiSummaryCard.jsx'
import DailyReportCard from '../components/dashboard/DailyReportCard.jsx'
import PeriodSelector from '../components/dashboard/PeriodSelector.jsx'
import RecentEventsTable from '../components/dashboard/RecentEventsTable.jsx'
import RiskTrendChart from '../components/dashboard/RiskTrendChart.jsx'
import RiskTypeDonutChart from '../components/dashboard/RiskTypeDonutChart.jsx'
import SafetyGradeCard from '../components/dashboard/SafetyGradeCard.jsx'
import SummaryCard from '../components/dashboard/SummaryCard.jsx'
import RiskTypePieChart from '../components/dashboard/RiskTypePieChart.jsx'
import RiskSectionStackChart from '../components/dashboard/RiskSectionStackChart.jsx'
import EducationPieChart from '../components/dashboard/EducationPieChart.jsx'
import ActionHistoryTable from '../components/dashboard/ActionHistoryTable.jsx'
import {
  EVENT_CATEGORY_MOCKUP_DATA,
  EDUCATION_INFO_MOCKUP_DATA,
} from '../mocks/mockData.js'
import {
  periodChartData,
  riskTypeData,
  summaryCards,
} from '../data/dashboardMock.js'

const API_BASE_URL = BACKEND_API_URL

function isCompleteStatus(status) {
  return status === '조치 완료' || status === '점검 완료'
}

function isPendingStatus(status) {
  return status === '조치 대기'
}

function countSummaryEvents(events, summaryId) {
  if (summaryId === 'realtime') {
    return events.filter((event) => event.status === '점검 대기').length
  }
  if (summaryId === 'pending') {
    return events.filter((event) => isPendingStatus(event.status)).length
  }
  if (summaryId === 'complete') {
    return events.filter((event) => event.status === '조치 완료').length
  }
  if (summaryId === 'violation') {
    return events.filter((event) => event.status === '점검 완료').length
  }
  return events.length
}

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ')
}

function getTimeByStatus(item, status) {
  if (status === '조치 대기' || status === '점검 대기') {
    return formatTime(item.created_at)
  }
  if (status === '조치 완료' || status === '점검 완료') {
    return formatTime(item.completed_at)
  }
  return formatTime(item.created_at ?? item.completed_at)
}

function makeInspectionEvent(item) {
  const status = item.status ?? '-'

  return {
    time: formatTime(item.date),
    location: item.location ?? '-',
    type: item.name ?? '-',
    manager: item.user_name ?? '-',
    status,
  }
}

function makeActionEvent(item) {
  const status = item.action_status ?? item.status ?? '-'

  return {
    time: getTimeByStatus(item, status),
    location: item.location ?? '-',
    type: item.action_name ?? '-',
    manager: item.handler_name ?? '-',
    status,
  }
}

function HomePage() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState('오늘')
  const [selectedSummaryId, setSelectedSummaryId] = useState('realtime')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [riskFactors, setRiskFactors] = useState(EVENT_CATEGORY_MOCKUP_DATA)
  const [educationChartData, setEducationChartData] = useState([])
  const [userData, setUserData] = useState([])
  const [inspectionHistoryData, setInspectionHistoryData] = useState([])
  const [actionHistoryData, setActionHistoryData] = useState([])
  const [homeDebugData, setHomeDebugData] = useState({ education: null, users: null })

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/risk/list`)
      .then((response) => {
        if (!Array.isArray(response.data)) return
        setRiskFactors(response.data.map((riskFactor) => ({
          type: riskFactor.category,
          item: riskFactor.category_name,
          risk: riskFactor.risk_level,
          severity: riskFactor.level,
          frequency: riskFactor.frequency,
        })))
      })
      .catch((error) => {
        console.error('홈 위험도 데이터 조회 실패:', error)
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    axios.get(`${API_BASE_URL}/api/admin/education/dashboard`, { headers })
      .then((response) => {
        console.log('교육 dashboard response:', response.data)
        const courses = Array.isArray(response.data?.courses) ? response.data.courses : []
        setHomeDebugData((current) => ({ ...current, education: response.data }))
        setEducationChartData(courses)
      })
      .catch((error) => {
        console.error('홈 교육 이수 데이터 조회 실패:', error)
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    axios.get(`${API_BASE_URL}/api/admin/users`, { headers })
      .then((response) => {
        console.log('users response:', response.data)
        const users = Array.isArray(response.data) ? response.data : (response.data?.items ?? response.data?.value ?? response.data?.users ?? [])
        setHomeDebugData((current) => ({ ...current, users: response.data }))
        setUserData(users)
      })
      .catch((error) => {
        console.error('홈 사용자 데이터 조회 실패:', error)
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    axios.get(`${API_BASE_URL}/api/inspection/histories/all`, { headers })
      .then((response) => {
        const histories = Array.isArray(response.data) ? response.data : (response.data?.items ?? response.data?.histories ?? [])
        setInspectionHistoryData(histories)
      })
      .catch((error) => {
        console.error('홈 점검 이력 데이터 조회 실패:', error)
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    axios.get(`${API_BASE_URL}/api/action-histories`, { headers })
      .then((response) => {
        const histories = Array.isArray(response.data) ? response.data : (response.data?.items ?? response.data?.histories ?? [])
        setActionHistoryData(histories)
      })
      .catch((error) => {
        console.error('홈 조치 이력 데이터 조회 실패:', error)
      })
  }, [])

  const mergedEvents = useMemo(() => [
    ...inspectionHistoryData.map(makeInspectionEvent),
    ...actionHistoryData.map(makeActionEvent),
  ], [inspectionHistoryData, actionHistoryData])

  const dashboardSummaryCards = useMemo(() => {
    return summaryCards.map((card) => ({
      ...card,
      value: countSummaryEvents(mergedEvents, card.id),
    }))
  }, [mergedEvents])

  return (
    <div className="home-dashboard">
      <section className="summary-grid" aria-label="홈 요약 지표">
        {dashboardSummaryCards.map((item) => (
          <SummaryCard
            item={item}
            isSelected={item.id === selectedSummaryId}
            key={item.id}
            onSelect={setSelectedSummaryId}
          />
        ))}
      </section>
      


      <section className="dashboard-main-grid">
        <RecentEventsTable
          events={mergedEvents}
          selectedSummaryID={selectedSummaryId}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          onClose={() => setSelectedEvent(null)}
        />

        <EducationPieChart eduData={educationChartData} userData={userData}></EducationPieChart>
     
      </section>
      


        <section className="risk-section">
        <div className="section-heading">
          <div>
            <h2 className="section-title">위험도 관리</h2>
            <p>전체 위험도 통계와 유형별 위험도 분포를 확인합니다.</p>
          </div>
        </div>

        <div className="risk-chart-grid">
          <RiskTypePieChart data={riskFactors} />
          <RiskSectionStackChart data={riskFactors} />
        </div>
      </section>


      <section className="risk-card compact-card">
        <ActionHistoryTable
          lists={actionHistoryData}
        />

        <div className="Page-move-wrapper">
            <button className="Page-move-button" type="button" onClick={() => navigate('/actions')}>
              조치 이력 페이지로 이동
            </button>
        </div>

      </section>



      <section className="statistics-section">
        <div className="section-heading">
          <div>
            <h2 className="section-title">기간별 통계량</h2>
            <p>기간별 위험 발생 추이와 위험 유형 비율을 확인합니다.</p>
          </div>
          <PeriodSelector selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod} />
        </div>

        <div className="statistics-chart-grid">
          <RiskTrendChart data={periodChartData[selectedPeriod]} />
          <RiskTypeDonutChart data={riskTypeData} />
        </div>
      </section>

      <DailyReportCard />

      <section className="safety-summary-row">
        <SafetyGradeCard />
        <AiSummaryCard />
      </section>
    </div>
  )
}

export default HomePage
import { BACKEND_API_URL } from '../config/api.js'
