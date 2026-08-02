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

function isCompletedStatus(status) {
  return status === '이수'
}

function makeTitleRoleEducationData(eduData, userData) {
  const roleByUid = new Map(
    userData.map((user) => [String(user.uid), user.role || '기타']),
  )

  return eduData.filter((course) => {
    const attendees = Array.isArray(course.attendees) ? course.attendees : []
    const educationTitle = course.title || attendees[0]?.education_title || ''

    return !educationTitle.toLowerCase().includes('veo')
  }).flatMap((course) => {
    const roleGroups = new Map()
    const attendees = Array.isArray(course.attendees) ? course.attendees : []
    const educationTitle = course.title || attendees[0]?.education_title || `교육 ${course.education_id}`

    attendees.forEach((attendee) => {
      const role = roleByUid.get(String(attendee.uid)) || '기타'
      const key = `${course.education_id}-${role}`
      const current = roleGroups.get(key) ?? {
        id: key,
        education_id: course.education_id,
        title: educationTitle,
        role,
        type: educationTitle,
        chartLabel: educationTitle,
        total: 0,
        trained: 0,
        untrained: 0,
      }

      current.total += 1
      if (isCompletedStatus(attendee.status)) {
        current.trained += 1
      } else {
        current.untrained += 1
      }

      roleGroups.set(key, current)
    })

    return [...roleGroups.values()]
  })
}

function makeEducationChartData(countData) {
  const roles = [...new Set(countData.map((item) => item.role))]
  const chartRows = new Map()

  countData.forEach((item) => {
    const current = chartRows.get(item.title) ?? {
      title: item.title,
      details: {},
    }
    const completionRate = item.total ? Number(((item.trained / item.total) * 100).toFixed(1)) : 0

    current[item.role] = completionRate
    current.details[item.role] = {
      total: item.total,
      trained: item.trained,
      untrained: item.untrained,
      completionRate,
    }

    chartRows.set(item.title, current)
  })

  return {
    roles,
    chartData: [...chartRows.values()],
  }
}

function splitTitleLines(title) {
  const words = String(title).split(' ')
  const lines = []

  words.forEach((word) => {
    const lastLine = lines[lines.length - 1]

    if (!lastLine || `${lastLine} ${word}`.length > 13) {
      lines.push(word)
    } else {
      lines[lines.length - 1] = `${lastLine} ${word}`
    }
  })

  return lines
}

function EducationTitleTick({ x, y, payload }) {
  const lines = splitTitleLines(payload.value)

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#64748b" fontSize={11} fontWeight={700}>
        {lines.map((line, index) => (
          <tspan x="0" dy={index === 0 ? 12 : 14} key={`${line}-${index}`}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}

function EducationTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload
  const role = payload[0]?.dataKey
  const detail = row?.details?.[role] ?? {}

  return (
    <div className="education-chart-tooltip">
      <strong>{label}</strong>
      <span>{role}</span>
      <span>대상 {detail.total ?? 0}명</span>
      <span>이수 {detail.trained ?? 0}명</span>
      <span>미이수 {detail.untrained ?? 0}명</span>
      <span>이수율 {detail.completionRate ?? 0}%</span>
    </div>
  )
}

function EducationPieChart({ eduData, userData }) {
  const navigate = useNavigate()
  const countData = makeTitleRoleEducationData(eduData, userData)
  const { chartData, roles } = makeEducationChartData(countData)
  const roleColors = ['#3974c6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#64748b']

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
            data={chartData}
            margin={{
              top: 16,
              right: 8,
              left: 0,
              bottom: 36,
            }}
          >
            <CartesianGrid vertical={false} stroke="#e7edf5" strokeDasharray="4 4" />
            <XAxis
              dataKey="title"
              height={88}
              interval={0}
              tick={<EducationTitleTick />}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              yAxisId="rate"
              width={42}
              allowDecimals={false}
              axisLine={false}
              domain={[0, 100]}
              tick={{ fill: '#7c899d', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
            />
            <Tooltip content={<EducationTooltip />} cursor={{ fill: 'rgba(47, 100, 183, 0.04)' }} shared={false} />
            <Legend iconType="circle" />
            {roles.map((role, index) => (
              <Bar
                yAxisId="rate"
                dataKey={role}
                fill={roleColors[index % roleColors.length]}
                key={role}
                radius={[9, 9, 0, 0]}
                barSize={24}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* <EducationTable lists={countData} /> */}

      <div className="Page-move-wrapper">
        <button className="Page-move-button" type="button" onClick={() => navigate('/education')}>
          교육 이수 페이지로 이동
        </button>
      </div>
    </Box>
  )
}

export default EducationPieChart
