import { Box, Typography } from '@mui/material'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const colors = ['#e7b0b5', '#f1d19b', '#b8cbe0', '#8eb6df']


function makeTypeCountData(events) {
  const countMap = {}
  events.forEach((event) => {
    countMap[event.type] = (countMap[event.type] || 0) + 1
  })

  return Object.entries(countMap).map(([type, count]) => ({
    type,
    count,
    percent: Number(((count / (events.length)) * 100).toFixed(1)),
  }))}
  
function RiskTypePieChart({ data }) {

const countdata= makeTypeCountData(data);
  return (
    <Box className="chart-card">
      <Typography variant="h6">전체 위험도 통계</Typography>
      <Box className="chart-body donut-chart-body">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={countdata} dataKey="percent" nameKey="type" innerRadius={0} outerRadius={88} paddingAngle={3} isAnimationActive animationBegin={180} animationDuration={1100} animationEasing="ease-out">
              {countdata.map((entry, index) => (
                <Cell key={entry.type} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(percent,name) => [`${percent}%`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <div className="donut-legend">
        {countdata.map((item, index) => (
          <div className="donut-legend-item" key={item.type}>
            <span>
              <i style={{ backgroundColor: colors[index % colors.length] }}></i>
              {item.type}
            </span>
            <strong>{item.percent}%</strong>
          </div>
        ))}
      </div>
    </Box>
  )
}

export default RiskTypePieChart
