import { Box, Card, Typography } from '@mui/material'
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

function DailyReportCard() {
  return (
    <Card className="daily-report-card">
      <div className="report-left">
        <Box className="report-icon">AI</Box>
        <div>
          <Typography variant="h6">오늘의 리포트</Typography>
          <Typography variant="body2">{formatToday()}</Typography>
        </div>
      </div>
      <img className="report-chart-image" src={reportChartImage} alt="" aria-hidden="true" />
    </Card>
  )
}

export default DailyReportCard
