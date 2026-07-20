import { Box, Typography } from '@mui/material'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function RiskTrendChart({ data }) {
  return (
    <Box className="chart-card">
      <Typography variant="h6">위험 발생 추이</Typography>
      <Box className="chart-body trend-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 64, bottom: 10, left: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" padding={{ left: 12, right: 12 }} tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={7} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={6} />
            <Tooltip formatter={(value) => [`${value}건`, '발생 건수']} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#5b8fd1"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive
              animationBegin={80}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default RiskTrendChart
