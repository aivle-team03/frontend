import { Box, Stack, Typography } from '@mui/material'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const colors = ['#ef4444', '#f59e0b', '#64748b', '#2f64b7']

function RiskTypeDonutChart({ data }) {
  return (
    <Box className="chart-card">
      <Typography variant="h6">위험 유형 비율</Typography>
      <Box className="chart-body donut-chart-body">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, '비율']} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Stack className="donut-legend" spacing={1}>
        {data.map((item, index) => (
          <Stack direction="row" alignItems="center" justifyContent="space-between" key={item.name}>
            <span>
              <i style={{ backgroundColor: colors[index % colors.length] }}></i>
              {item.name}
            </span>
            <strong>{item.value}%</strong>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

export default RiskTypeDonutChart
