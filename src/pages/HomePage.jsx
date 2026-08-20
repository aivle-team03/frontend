import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PeriodSelector from '../components/dashboard/PeriodSelector.jsx'
import RecentEventsTable from '../components/dashboard/RecentEventsTable.jsx'
import RiskTrendChart from '../components/dashboard/RiskTrendChart.jsx'
import RiskTypeDonutChart from '../components/dashboard/RiskTypeDonutChart.jsx'
import SummaryCard from '../components/dashboard/SummaryCard.jsx'
import RiskTypePieChart from '../components/dashboard/RiskTypePieChart.jsx'
import RiskSectionStackChart from '../components/dashboard/RiskSectionStackChart.jsx'
import EducationPieChart from '../components/dashboard/EducationPieChart.jsx'
import ActionHistoryTable from '../components/dashboard/ActionHistoryTable.jsx'
import { useUiLanguage } from '../utils/uiLanguage.js'

const API_BASE_URL = BACKEND_API_URL

const SUMMARY_CARD_DEFINITIONS = [
  { id: 'realtime', title: '점검 대기', description: '점검 대기 건수' },
  { id: 'violation', title: '점검 완료', description: '점검 완료 건수' },
  { id: 'pending', title: '조치 대기', description: '미완료 조치 항목' },
  { id: 'complete', title: '조치 완료', description: '완료된 조치 항목' },
]


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
  return String(value).replace('T', ' ').slice(0, 16)
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
    riskType: item.category ?? item.category_name ?? item.risk_category ?? item.name ?? '-',
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
    riskType: item.category ?? item.category_name ?? item.risk_category ?? item.type ?? item.action_name ?? '-',
    manager: item.handler_name ?? '-',
    status,
  }
}

function makeRiskTypeData(events) {
  const counts = new Map()
  events.forEach((item) => {
    const name = item.riskType || item.type
    if (name) counts.set(name, (counts.get(name) || 0) + 1)
  })
  return [...counts].map(([name, value]) => ({ name, value }))
}

function filterEventsByPeriod(events, selectedPeriod) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const rangeDays = selectedPeriod === '오늘' ? 1 : selectedPeriod === '최근 7일' ? 7 : 28

  return events.filter((event) => {
    const date = new Date(event.time)
    if (Number.isNaN(date.getTime())) return false
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((startOfToday - eventDay) / 86400000)
    return diffDays >= 0 && diffDays < rangeDays
  })
}

function makeTrendData(events, selectedPeriod) {
  const today = new Date()
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const bucketCount = selectedPeriod === '오늘' ? 4 : selectedPeriod === '최근 7일' ? 7 : 4
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({ label: '', count: 0, start: null }))

  if (selectedPeriod === '오늘') {
    buckets.forEach((bucket, index) => { bucket.label = `${String(index * 6).padStart(2, '0')}:00`; bucket.start = index * 6 })
    events.forEach((event) => {
      const date = new Date(event.time)
      if (Number.isNaN(date.getTime()) || date.toDateString() !== dayStart.toDateString()) return
      const index = Math.min(3, Math.floor(date.getHours() / 6))
      buckets[index].count += 1
    })
  } else {
    const rangeDays = selectedPeriod === '최근 7일' ? 7 : 28
    buckets.forEach((bucket, index) => { bucket.label = selectedPeriod === '최근 7일' ? `${index + 1}d` : `${index + 1}w` })
    events.forEach((event) => {
      const date = new Date(event.time)
      if (Number.isNaN(date.getTime())) return
      const diffDays = Math.floor((dayStart - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000)
      if (diffDays < 0 || diffDays >= rangeDays) return
      const index = selectedPeriod === '최근 7일' ? rangeDays - 1 - diffDays : Math.min(3, 3 - Math.floor(diffDays / 7))
      buckets[index].count += 1
    })
  }
  return buckets
}

function HomePage() {
  const navigate = useNavigate()
  const { t } = useUiLanguage()
  const [selectedPeriod, setSelectedPeriod] = useState('오늘')
  const [selectedSummaryId, setSelectedSummaryId] = useState('realtime')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [riskFactors, setRiskFactors] = useState([])
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
        const courses = Array.isArray(response.data?.courses) ? response.data.courses : []
        setHomeDebugData((current) => ({ ...current, education: response.data }))
        setEducationChartData(courses)
      })
      .catch((error) => {
        setEducationChartData([])
        console.error('홈 교육 이수 데이터 조회 실패:', error)
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    axios.get(`${API_BASE_URL}/api/admin/users`, { headers })
      .then((response) => {
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
    return SUMMARY_CARD_DEFINITIONS.map((card) => ({
      ...card,
      value: countSummaryEvents(mergedEvents, card.id),
    }))
  }, [mergedEvents])
  const periodEvents = useMemo(() => filterEventsByPeriod(mergedEvents, selectedPeriod), [mergedEvents, selectedPeriod])
  const riskTypeData = useMemo(() => makeRiskTypeData(periodEvents), [periodEvents])
  const trendData = useMemo(() => makeTrendData(mergedEvents, selectedPeriod), [mergedEvents, selectedPeriod])

  return (
    <div className="home-dashboard">
      <section className="summary-grid" aria-label={t('홈 요약 지표')}>
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

        <EducationPieChart eduData={educationChartData} userData={userData} />

      </section>



      <section className="risk-section">
        <div className="section-heading">
          <div>
            <h2 className="section-title">{t('위험도 관리')}</h2>
            <p>{t('전체 위험도 통계와 유형별 위험도 분포를 확인합니다.')}</p>
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
            {t('조치 이력 페이지로 이동')}
          </button>
        </div>

      </section>



      <section className="statistics-section">
        <div className="section-heading">
          <div>
            <h2 className="section-title">{t('기간별 통계량')}</h2>
            <p>{t('기간별 위험 발생 추이와 위험 유형 비율을 확인합니다.')}</p>
          </div>
          <PeriodSelector selectedPeriod={selectedPeriod} onSelectPeriod={setSelectedPeriod} />
        </div>

        <div className="statistics-chart-grid">
          <RiskTrendChart data={trendData} />
          <RiskTypeDonutChart data={riskTypeData} />
        </div>
      </section>

    </div>
  )
}

export default HomePage
import { BACKEND_API_URL } from '../config/api.js'
