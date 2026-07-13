function AreaRiskChart({ risks }) {
  return (
    <section className="dashboard-card area-risk">
      <h2>구역별 위험도 현황</h2>
      <div className="risk-list">
        {risks.map((risk) => (
          <div className="risk-row" key={risk.area}>
            <span>{risk.area}</span>
            <div className="risk-track" aria-label={`${risk.area} 위험도 ${risk.value}`}>
              <div className="risk-bar" style={{ width: `${risk.value}%` }}></div>
            </div>
            <strong>{risk.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AreaRiskChart
