const periodOptions = ['오늘', '최근 7일', '이번 달', '지난 달', '직접 설정']

function PeriodStatistics({ selectedPeriod, onSelectPeriod }) {
  return (
    <aside className="period-panel">
      <h2>기간 설정</h2>
      <div className="period-options">
        {periodOptions.map((option) => (
          <button
            className={selectedPeriod === option ? 'period-button is-active' : 'period-button'}
            key={option}
            type="button"
            onClick={() => onSelectPeriod(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default PeriodStatistics
