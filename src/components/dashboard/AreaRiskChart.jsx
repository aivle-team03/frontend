import { Box, Typography } from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const riskTones = [
  { key: 'stable', label: '안정', color: '#198038' },
  { key: 'watch', label: '관찰', color: '#f1c21b' },
  { key: 'caution', label: '주의', color: '#ff832b' },
  { key: 'high', label: '높음', color: '#da1e28' },
]

function getRiskTone(value) {
  if (value >= 70) return riskTones[3]
  if (value >= 55) return riskTones[2]
  if (value >= 40) return riskTones[1]
  return riskTones[0]
}

function AreaRiskChart({ risks, selectedArea, onSelectArea }) {
  const selectedRisk = risks.find((risk) => risk.area === selectedArea)
  const selectedTone = selectedRisk ? getRiskTone(selectedRisk.value) : null

  const handleAreaClick = (area) => {
    onSelectArea(selectedArea === area ? null : area)
  }

  return (
    <Box className="dashboard-card compact-card">
      <div className="chart-card-heading">
        <div>
          <Typography variant="h6">구역별 위험도 현황</Typography>
          <Typography className="chart-card-caption">같은 구역을 다시 누르면 선택이 해제됩니다.</Typography>
        </div>
        <div className="risk-level-legend" aria-label="위험도 범례">
          {riskTones.map((tone) => (
            <span key={tone.key}><i className={`risk-dot risk-dot-${tone.key}`} />{tone.label}</span>
          ))}
        </div>
      </div>
      <Box className="risk-chart">
        <ResponsiveContainer width="100%" height={238}>
          <BarChart data={risks} layout="vertical" margin={{ top: 8, right: 42, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#e8edf4" strokeDasharray="4 4" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis dataKey="area" type="category" width={56} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 700 }} />
            <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }} formatter={(value) => [`${value}점`, '위험도']} />
            <Bar dataKey="value" barSize={18} background={{ fill: '#eef2f7', radius: 9 }} radius={[0, 9, 9, 0]} isAnimationActive animationBegin={120} animationDuration={1100} animationEasing="ease-out" onClick={(data) => handleAreaClick(data.area)}>
              {risks.map((risk) => {
                const tone = getRiskTone(risk.value)
                return (
                  <Cell
                    cursor="pointer"
                    fill={tone.color}
                    key={risk.area}
                  />
                )
              })}
              <LabelList dataKey="value" position="right" formatter={(value) => `${value}`} fill="#334155" fontSize={12} fontWeight={800} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Typography className="selected-area">
        <span>선택 구역</span>
        <strong>{selectedArea ?? '전체'}</strong>
        {selectedTone && (
          <em className={`risk-level-badge risk-level-${selectedTone.key}`}>
            {selectedTone.label}
          </em>
        )}
      </Typography>
    </Box>
  )
}

export default AreaRiskChart
