import { useMemo, useState } from 'react'
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
  ACTION_HISTORY_MOCK_DATA
} from '../mocks/mockData.js'
import {
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

        <EducationPieChart data={EDUCATION_INFO_MOCKUP_DATA}></EducationPieChart>
      </section>
      


        <section className="risk-section">
        <div className="section-heading">
          <div>
            <h2 className="section-title">위험도 관리</h2>
            <p>전체 위험도 통계와 구간 별 위험도 분포를 확인합니다.</p>
          </div>
        </div>

        <div className="risk-chart-grid">
          <RiskTypePieChart data={EVENT_CATEGORY_MOCKUP_DATA} />
          <RiskSectionStackChart  data={EVENT_CATEGORY_MOCKUP_DATA} />
        </div>
      </section>


      <section className="risk-card compact-card">
        <ActionHistoryTable
          lists={ACTION_HISTORY_MOCK_DATA}
        />

        <div className="Page-move-wrapper">
            <button className="Page-move-button" type="button">
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
