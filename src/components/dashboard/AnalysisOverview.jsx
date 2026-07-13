function AnalysisOverview({ items }) {
  return (
    <section className="analysis-card">
      <h2>주요 분석 내용</h2>
      <dl className="analysis-list">
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default AnalysisOverview
