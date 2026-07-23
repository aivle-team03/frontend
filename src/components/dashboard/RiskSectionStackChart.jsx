import { Box, Typography } from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const riskLevels = [
  { key: '상', label: '상', color: '#ef4444', tone: 'high' },
  { key: '중', label: '중', color: '#f59e0b', tone: 'medium' },
  { key: '하', label: '하', color: '#10b981', tone: 'low' },
]

function makeSectionCountData(events = []) {
  const countMap = {}

  events.forEach((event) => {
    const { location, risk } = event

    if (!location || !risk) return

    if (!countMap[location]) {
      countMap[location] = riskLevels.reduce(
        (section, level) => ({ ...section, [level.key]: 0 }),
        { location, total: 0 },
      )
    }

    if (countMap[location][risk] === undefined) {
      countMap[location][risk] = 0
    }

    countMap[location][risk] += 1
    countMap[location].total += 1
  })

  return Object.values(countMap).sort((a, b) => b.total - a.total)
}

function getLevelTotals(sectionData) {
  return riskLevels.reduce((totals, level) => ({
    ...totals,
    [level.key]: sectionData.reduce((sum, section) => sum + (section[level.key] || 0), 0),
  }), {})
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

  const total = payload.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="risk-section-tooltip">
      <strong>{label}</strong>
      <span>총 {total}건</span>
      {payload.map((item) => (
        <p key={item.dataKey}>
          <i style={{ backgroundColor: item.fill }} />
          {item.dataKey}
          <b>{item.value}건</b>
        </p>
      ))}
    </div>
  )
}

function RiskSectionStackChart({ data }) {
  const countData = makeSectionCountData(data)
  const levelTotals = getLevelTotals(countData)
  const totalCount = countData.reduce((sum, section) => sum + section.total, 0)
  const maxTotal = Math.max(1, ...countData.map((section) => section.total))
  const ticks = getTicks(maxTotal)

  return (
    <Box className="risk-card risk-section-stack-card">
      <div className="chart-card-heading risk-section-stack-heading compact-card">
        <div>
          <Typography variant="h6">구역별 위험도 분포</Typography>
        </div>
        <div className="risk-section-total-pill">
          <span>총 감지</span>
          <strong>{totalCount}건</strong>
        </div>
      </div>

      <div className="risk-section-stack-summary" aria-label="위험 단계별 감지 건수">
        {riskLevels.map((level) => (
          <div className={`risk-section-stat risk-section-stat-${level.tone}`} key={level.key}>
            <span>
              <i style={{ backgroundColor: level.color }} />
              {level.label}
            </span>
            <strong>{levelTotals[level.key] ?? 0}</strong>
          </div>
        ))}
      </div>

      <Box className="chart-body risk-section-stack-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={countData}
            layout="vertical"
            margin={{ top: 8, right: 20, bottom: 4, left: 0 }}
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
              dataKey="location"
              tick={{ fontSize: 12, fill: '#334155', fontWeight: 800 }}
              tickLine={false}
              tickMargin={8}
              type="category"
              width={54}
            />
            <Tooltip content={<RiskSectionTooltip />} cursor={{ fill: 'rgba(47, 100, 183, 0.04)' }} />

            {riskLevels.map((level, index) => (
              <Bar
                barSize={22}
                dataKey={level.key}
                fill={level.color}
                isAnimationActive
                key={level.key}
                radius={index === riskLevels.length - 1 ? [0, 9, 9, 0] : [0, 0, 0, 0]}
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
              <i className={`risk-dot risk-section-dot-${level.tone}`} />
              {level.label}
            </span>
          ))}
        </div>
      </div>
    </Box>
  )
}

export default RiskSectionStackChart
