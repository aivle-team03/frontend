function SummaryCard({ item }) {
  return (
    <article className="summary-card">
      <h2>{item.title}</h2>
      <strong>{item.value}</strong>
      <div className="summary-change">
        <span aria-hidden="true"></span>
        <span>{item.change}</span>
      </div>
      <p>{item.description}</p>
    </article>
  )
}

export default SummaryCard
