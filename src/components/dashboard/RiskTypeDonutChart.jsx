import { Box, Typography } from '@mui/material'
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const riskTypeColors = ['#6929c4', '#1192e8', '#005d5d', '#9f1853']

function RiskTypeDonutChart({ data }) {
  return (
    <Box className="chart-card">
      <div className="chart-card-heading">
        <div>
          <Typography variant="h6">위험 유형 비율</Typography>
          <Typography className="chart-card-caption">감지 항목별 구성 비율입니다.</Typography>
        </div>
      </div>
      <Box className="chart-body donut-chart-body">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} cornerRadius={5} paddingAngle={3} stroke="none" isAnimationActive animationBegin={180} animationDuration={1100} animationEasing="ease-out">
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={riskTypeColors[index % riskTypeColors.length]} />
              ))}
              <Label value="위험 유형" position="center" className="donut-center-label" />
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, '비율']} cursor={false} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <div className="donut-legend">
        {data.map((item, index) => (
          <div className="donut-legend-item" key={item.name}>
            <span>
              <i style={{ backgroundColor: riskTypeColors[index % riskTypeColors.length] }} />
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
