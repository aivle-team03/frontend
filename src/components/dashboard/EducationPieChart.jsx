import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import EducationTable from './EducationTable.jsx'

function makeTypeCountData(data) {
  const total = data.reduce((sum, item) => sum + item.total, 0)
  const trained = data.reduce((sum, item) => sum + item.trained, 0)

  return [
    {
      type: '전체 근로자',
      total,
      trained,
      percent: Number(((trained / total) * 100).toFixed(1)),
    },
  ]
}

function EducationTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const total = payload.find((item) => item.dataKey === 'total')?.value ?? 0
  const trained = payload.find((item) => item.dataKey === 'trained')?.value ?? 0

  return (
    <div className="education-chart-tooltip">
      <strong>{label}</strong>
      <span>대상 {total}명</span>
      <span>이수 {trained}명</span>
    </div>
  )
}

function EducationPieChart({ data }) {
  const navigate = useNavigate()

  const countData = [
    ...data,
    ...makeTypeCountData(data),
  ]

  return (
    <Box className="edu-card compact-card">
      <div className="education-chart-heading">
        <div>
          <Typography variant="h6">교육 이수 현황</Typography>
          <p>대상자별 이수 인원을 확인합니다.</p>
        </div>
      </div>

      <Box className="chart-body donut-chart-body education-completion-chart">
        <ResponsiveContainer width="100%" height={270}>
          <BarChart
            data={countData}
            margin={{
              top: 16,
              right: 8,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} stroke="#e7edf5" strokeDasharray="4 4" />
            <XAxis dataKey="type" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} tickLine={false} />
            <YAxis
              yAxisId="count"
              width={42}
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: '#7c899d', fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip content={<EducationTooltip />} cursor={{ fill: 'rgba(47, 100, 183, 0.04)' }} />
            <Legend
              iconType="circle"
              formatter={(value) => ({
                total: '대상',
                trained: '이수',
              }[value])}
            />
            <Bar yAxisId="count" dataKey="total" fill="#dbe7f6" radius={[9, 9, 0, 0]} barSize={28} />
            <Bar yAxisId="count" dataKey="trained" fill="#3974c6" radius={[9, 9, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <EducationTable lists={countData} />

      <div className="Page-move-wrapper">
        <button className="Page-move-button" type="button" onClick={() => navigate('/education')}>
          교육 이수 페이지로 이동
        </button>
      </div>
    </Box>
  )
}

export default EducationPieChart
