import { Box, Typography } from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const riskLevels = [
  { key: '상', label: '상', color: '#e85d5d' },
  { key: '중', label: '중', color: '#f2a43a' },
  { key: '하', label: '하', color: '#30b77b' },
]

function makeTypeCountData(events = []) {
  const countMap = {}

  events.forEach((event) => {
    const { type, risk } = event

    if (!type || !risk) return

    if (!countMap[type]) {
      countMap[type] = riskLevels.reduce(
        (riskType, level) => ({ ...riskType, [level.key]: 0 }),
        { type, total: 0 },
      )
    }

    if (countMap[type][risk] === undefined) {
      countMap[type][risk] = 0
    }

    countMap[type][risk] += 1
    countMap[type].total += 1
  })

  return Object.values(countMap).sort((a, b) => b.total - a.total)
}

function getTicks(maxTotal) {
  if (maxTotal <= 5) {
    return Array.from({ length: maxTotal + 1 }, (_, index) => index)
  }

  const step = Math.ceil(maxTotal / 4)
  return Array.from({ length: 5 }, (_, index) => index * step)
}

function RiskSectionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const visiblePayload = payload.filter((item) => item.value > 0)
  const total = visiblePayload.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="risk-section-tooltip">
      <strong>{label}</strong>
      <span>총 {total}건</span>
      {visiblePayload.map((item) => (
        <p key={item.dataKey}>
          <i style={{ backgroundColor: item.fill }} />
          {item.dataKey}
          <b>{item.value}건</b>
        </p>
      ))}
    </div>
  )
}

function RiskBarSegment({ levelIndex, ...props }) {
  const { payload } = props
  const isLastVisibleSegment = riskLevels
    .slice(levelIndex + 1)
    .every((level) => !payload[level.key])

  return (
    <Rectangle
      {...props}
      radius={isLastVisibleSegment ? [0, 10, 10, 0] : [0, 0, 0, 0]}
    />
  )
}

function RiskSectionStackChart({ data }) {
  const countData = makeTypeCountData(data)
  const totalCount = countData.reduce((sum, section) => sum + section.total, 0)
  const maxTotal = Math.max(1, ...countData.map((section) => section.total))
  const ticks = getTicks(maxTotal)

  return (
    <Box className="risk-card risk-section-stack-card">
      <div className="chart-card-heading risk-section-stack-heading compact-card">
        <div>
          <Typography variant="h6">유형별 위험도 분포</Typography>
        </div>
        <div className="risk-section-total-pill">
          <span>총 감지</span>
          <strong>{totalCount}건</strong>
        </div>
      </div>

      <Box className="chart-body risk-section-stack-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={countData}
            layout="vertical"
            margin={{ top: 16, right: 28, bottom: 8, left: 4 }}
          >
            <CartesianGrid horizontal={false} stroke="#e8edf4" strokeDasharray="4 4" />
            <XAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, ticks[ticks.length - 1]]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              ticks={ticks}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="type"
              tick={{ fontSize: 12, fill: '#334155', fontWeight: 900 }}
              tickLine={false}
              tickMargin={10}
              type="category"
              width={76}
            />
            <Tooltip content={<RiskSectionTooltip />} cursor={{ fill: 'rgba(47, 100, 183, 0.04)' }} />

            {riskLevels.map((level, index) => (
              <Bar
                barSize={28}
                dataKey={level.key}
                fill={level.color}
                isAnimationActive
                key={level.key}
                shape={(props) => <RiskBarSegment {...props} levelIndex={index} />}
                stackId="risk"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <div className="risk-section-stack-footer">
        <div className="risk-level-legend" aria-label="위험도 범례">
          {riskLevels.map((level) => (
            <span key={level.key}>
              <i style={{ background: level.color }} />
              {level.label}
            </span>
          ))}
        </div>
      </div>
    </Box>
  )
}

export default RiskSectionStackChart
