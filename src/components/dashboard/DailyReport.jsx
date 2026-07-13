import reportChartImage from '../../assets/report-chart.png'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

function formatToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const date = String(today.getDate()).padStart(2, '0')
  const weekday = weekdays[today.getDay()]

  return `${year}년 ${month}월 ${date}일 (${weekday}) 기준`
}

function DailyReport() {
  return (
    <section className="daily-report">
      <div className="report-icon" aria-hidden="true">
        AI
      </div>
      <div className="report-copy">
        <h2>오늘의 리포트</h2>
        <p>{formatToday()}</p>
      </div>
      <img className="report-chart-image" src={reportChartImage} alt="" aria-hidden="true" />
    </section>
  )
}

export default DailyReport
