import { useMemo, useState } from 'react'
import AiSummaryCard from '../components/dashboard/AiSummaryCard.jsx'
import AreaRiskChart from '../components/dashboard/AreaRiskChart.jsx'
import DailyReportCard from '../components/dashboard/DailyReportCard.jsx'
import PeriodSelector from '../components/dashboard/PeriodSelector.jsx'
import RecentEventsTable from '../components/dashboard/RecentEventsTable.jsx'
import RiskTrendChart from '../components/dashboard/RiskTrendChart.jsx'
import RiskTypeDonutChart from '../components/dashboard/RiskTypeDonutChart.jsx'
import SafetyGradeCard from '../components/dashboard/SafetyGradeCard.jsx'
import SummaryCard from '../components/dashboard/SummaryCard.jsx'
import {
  areaRisks,
  periodChartData,
  recentEvents,
  riskTypeData,
  summaryCards,
} from '../data/dashboardMock.js'

function filterEvents(events, selectedSummaryId) {
  if (selectedSummaryId === 'pending') {
    return events.filter((event) => event.status === '조치 대기')
  }
  if (selectedSummaryId === 'complete') {
    return events.filter((event) => event.status === '조치 완료')
  }
  if (selectedSummaryId === 'violation') {
    return events.filter((event) => event.type !== '연기')
  }
  return events
}

function HomePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('오늘')
  const [selectedSummaryId, setSelectedSummaryId] = useState('realtime')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)

  const filteredEvents = useMemo(
    () => filterEvents(recentEvents, selectedSummaryId),
    [selectedSummaryId],
  )

  return (
    <div className="home-dashboard">
      <section className="summary-grid" aria-label="홈 요약 지표">
        {summaryCards.map((item) => (
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
          events={filteredEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
        <AreaRiskChart
          risks={areaRisks}
          selectedArea={selectedArea}
          onSelectArea={setSelectedArea}
        />
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
