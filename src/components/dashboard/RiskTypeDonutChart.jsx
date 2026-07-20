import { Box, Typography } from '@mui/material'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const colors = ['#e7b0b5', '#f1d19b', '#b8cbe0', '#8eb6df']

function RiskTypeDonutChart({ data }) {
  return (
    <Box className="chart-card">
      <Typography variant="h6">위험 유형 비율</Typography>
      <Box className="chart-body donut-chart-body">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3} isAnimationActive animationBegin={180} animationDuration={1100} animationEasing="ease-out">
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, '비율']} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <div className="donut-legend">
        {data.map((item, index) => (
          <div className="donut-legend-item" key={item.name}>
            <span>
              <i style={{ backgroundColor: colors[index % colors.length] }}></i>
              {item.name}
            </span>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
    </Box>
  )
}

export default RiskTypeDonutChart
