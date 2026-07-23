import '../styles/risk.css'
import { EVENT_CATEGORY_MOCKUP_DATA } from '../mocks/mockData.js'
import RiskFactorTypeChart from '../components/riskmanagement/RiskFactorTypeChart.jsx'
import EventCategoryTable from '../components/riskmanagement/EventCategoryTable.jsx'
import { Typography } from '@mui/material'

function Riskicon({ name }) {
  const commonProps = {
    className: 'riskicon',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  if (name === 'warning') {
    return (
      <svg {...commonProps}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        />
      </svg>
    )
  }

  return null
}

function countBy(items, key) {
  return items.reduce((counts, item) => ({
    ...counts,
    [item[key]]: (counts[item[key]] ?? 0) + 1,
  }), {})
}

function getTopEntry(counts) {
  const entries = Object.entries(counts)

  if (!entries.length) {
    return { label: '-', value: 0 }
  }

  const [label, value] = entries.sort((a, b) => b[1] - a[1])[0]
  return { label, value }
}

function RiskManagementPage() {
  const risks = EVENT_CATEGORY_MOCKUP_DATA
  const totalRiskCount = risks.length
  const totalFrequency = risks.reduce((sum, risk) => sum + risk.frequency, 0)
  const averageSeverity = totalRiskCount
    ? (risks.reduce((sum, risk) => sum + risk.severity, 0) / totalRiskCount).toFixed(1)
    : '0.0'
  const riskLevelCounts = countBy(risks, 'risk')
  const typeCounts = countBy(risks, 'type')
  const locationCounts = countBy(risks, 'location')
  const topType = getTopEntry(typeCounts)
  const topLocation = getTopEntry(locationCounts)
  const highRiskCount = riskLevelCounts['상'] ?? 0

  const summaryCards = [
    { label: '전체 항목', value: totalRiskCount, unit: '건' },
    { label: '평균 강도', value: averageSeverity, unit: '점' },
    { label: '총 빈도', value: totalFrequency, unit: '회' },
  ]

  return (
    <section className="risk-page-layout" aria-label="위험도 관리">
      <header className="risk-page-header">
        <div className="risk-kpi-grid" aria-label="위험도 요약">
          {summaryCards.map((card) => (
            <div className="risk-kpi-card" key={card.label}>
              <span>{card.label}</span>
              <strong>
                {card.value}
                <small>{card.unit}</small>
              </strong>
            </div>
          ))}
        </div>
      </header>

      <div className="risk-top-layout">
        <div className="count-card">
          <div className="risk-count-layout">
            <div className="risk-card-heading">
              <div>
                <Typography variant="h6">핵심 위험 요인</Typography>
              </div>
            </div>

            <div className="count-icon-text">
              <div className="count-icon-box">
                <Riskicon name="warning" />
              </div>

              <div className="count-text-box">
                <span>상 위험 항목</span>
                <strong>{highRiskCount}건</strong>
                <p>전체 {totalRiskCount}건 중 즉시 확인 대상</p>
              </div>
            </div>

            <div className="risk-focus-list">
              <div>
                <span>최다 유형</span>
                <strong>{topType.label}</strong>
                <em>{topType.value}건</em>
              </div>
              <div>
                <span>최다 구역</span>
                <strong>{topLocation.label}</strong>
                <em>{topLocation.value}건</em>
              </div>
            </div>
          </div>
        </div>

        <div className="count-graph">
          <div className="risk-graph-layout">
            <div className="risk-card-heading">
              <div>
                <Typography variant="h6">위험 요인 유형 그래프</Typography>
              </div>
              <span className="risk-card-chip">전체 {totalRiskCount}건</span>
            </div>

            <div className="risk-chart-frame">
              <RiskFactorTypeChart risks={risks} />
            </div>
          </div>
        </div>
      </div>

      <div className="risk-bottom-layout">
        <div className="risk-list">
          <div className="risk-card-heading risk-list-heading">
            <div>
              <Typography variant="h6">위험 요인 리스트</Typography>
            </div>
            <span className="risk-card-chip">{totalRiskCount}개 항목</span>
          </div>

          <EventCategoryTable events={risks} />
        </div>

        <aside className="risk-list-button" aria-label="위험 요인 관리 작업">
          <div className="risk-action-copy">
            <strong>위험 요인 편집</strong>
          </div>

          <div className="risk-button-layout">
            <button className="risk-add-button" type="button">
              항목 추가
            </button>

            <button className="risk-add-button" type="button">
              항목 제거
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default RiskManagementPage
