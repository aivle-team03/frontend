import { Box, Typography } from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function getRiskColor(value) {
  if (value >= 70) return '#ef4444'
  if (value >= 40) return '#f59e0b'
  return '#16a34a'
}

function AreaRiskChart({ risks, selectedArea, onSelectArea }) {
  return (
    <Box className="dashboard-card compact-card">
      <Typography variant="h6">구역별 위험도 현황</Typography>
      <Box className="risk-chart">
        <ResponsiveContainer width="100%" height={238}>
          <BarChart data={risks} layout="vertical" margin={{ top: 6, right: 28, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="area" type="category" width={50} />
            <Tooltip formatter={(value) => [`${value}`, '위험도']} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} onClick={(data) => onSelectArea(data.area)}>
              {risks.map((risk) => (
                <Cell
                  cursor="pointer"
                  fill={getRiskColor(risk.value)}
                  key={risk.area}
                  opacity={!selectedArea || selectedArea === risk.area ? 1 : 0.42}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Typography className="selected-area">
        선택 구역: <strong>{selectedArea ?? '전체'}</strong>
      </Typography>
    </Box>
  )
}

export default AreaRiskChart
