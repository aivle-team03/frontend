import { Box, Typography } from '@mui/material'
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from 'recharts'

function makeSectionCountData(events) {
  const countMap = {}
  events.forEach((event) => {
    const { location, risk } = event

    if (!countMap[location]) {
      countMap[location] = {
        location,
        상: 0,
        중: 0,
        하: 0,
      }
    }

    // risk별 증가
    countMap[location][risk] += 1
  })

  return Object.values(countMap)
}
  
function RiskSectionStackChart({ data }) {

const countdata= makeSectionCountData(data);
  return (
   <Box className="risk-card">
      <Typography variant="h6">구역별 위험도 통계 그래프</Typography>
      <Box className="chart-body trend-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={countdata} margin={{ top: 8, right: 64, bottom: 10, left: 8 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" axisLine={false}    ticks={[0,1,2,3,4,5]} tickLine={false} />
            <YAxis type="category" dataKey="location" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={6} />
            <Tooltip formatter={(value,name) => [`${value}건`, name]} />

            <Bar dataKey="상" stackId="a" fill="#ff0000"  barSize={30} >
            </Bar>

            {/* 노란색 영역 */}
            <Bar dataKey="중" stackId="a" fill="#ffd152">
            </Bar>

            {/* 초록색 영역 */}
            <Bar dataKey="하" stackId="a" fill="#32c864" radius={[0, 8, 8, 0]}>
            
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default RiskSectionStackChart
