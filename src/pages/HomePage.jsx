import { useState } from 'react'
import AnalysisOverview from '../components/dashboard/AnalysisOverview.jsx'
import AreaRiskChart from '../components/dashboard/AreaRiskChart.jsx'
import DailyReport from '../components/dashboard/DailyReport.jsx'
import PeriodStatistics from '../components/dashboard/PeriodStatistics.jsx'
import RecentEvents from '../components/dashboard/RecentEvents.jsx'
import SafetyGradeSummary from '../components/dashboard/SafetyGradeSummary.jsx'
import SummaryCard from '../components/dashboard/SummaryCard.jsx'
import {
  analysisItems,
  areaRisks,
  recentEvents,
  summaryCards,
} from '../data/dashboardMock.js'

function HomePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('오늘')

  return (
    <div className="home-dashboard">
      <section className="summary-grid" aria-label="홈 요약 지표">
        {summaryCards.map((item) => (
          <SummaryCard item={item} key={item.title} />
        ))}
      </section>

      <section className="dashboard-main-grid">
        <RecentEvents events={recentEvents} />
        <AreaRiskChart risks={areaRisks} />
      </section>

      <section className="statistics-section">
        <div className="statistics-content">
          <div className="section-heading">
            <h2 className="section-title">기간별 통계량</h2>
          </div>
          <DailyReport />
          <SafetyGradeSummary />
          <AnalysisOverview items={analysisItems} />
        </div>
        <PeriodStatistics
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
        />
      </section>
    </div>
  )
}

export default HomePage
