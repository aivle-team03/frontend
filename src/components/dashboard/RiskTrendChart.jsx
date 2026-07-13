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
      <Box className="chart-body">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 18, right: 24, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip formatter={(value) => [`${value}건`, '발생 건수']} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2f64b7"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default RiskTrendChart
