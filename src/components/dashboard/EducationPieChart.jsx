import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUiLanguage } from '../../utils/uiLanguage.js'
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

const HOME_EDUCATION_IDS = [6, 7, 8]
const ROLE_ORDER = ['\uC548\uC804\uAD00\uB9AC\uC790', '\uAD00\uC81C\uC0AC', '\uD604\uC7A5\uAD00\uB9AC\uC790', '\uC77C\uBC18\uC720\uC800']
const ROLE_COLORS = {
  [ROLE_ORDER[0]]: '#3974c6',
  [ROLE_ORDER[1]]: '#f59e0b',
  [ROLE_ORDER[2]]: '#10b981',
  [ROLE_ORDER[3]]: '#8b5cf6',
}

function normalizeRole(role) {
  const normalizedRole = String(role ?? '').replace(/\s/g, '')
  return ROLE_ORDER.includes(normalizedRole) ? normalizedRole : (normalizedRole || '\uAE30\uD0C0')
}

function getDisplayedEducationIds(eduData, useLatestCourses) {
  if (!useLatestCourses) return HOME_EDUCATION_IDS

  return [...eduData]
    .sort((left, right) => String(right.created_at ?? right.createdAt ?? right.education_id)
      .localeCompare(String(left.created_at ?? left.createdAt ?? left.education_id)))
    .slice(0, 3)
    .map((course) => Number(course.education_id))
}

function isHomeCompletedStatus(status) {
  const normalizedStatus = String(status ?? '').trim().toLowerCase()
  return isCompletedStatus(status) || ['\uC774\uC218', '\uC774\uC218 \uC644\uB8CC', 'completed', 'complete'].includes(normalizedStatus)
}

function isCompletedStatus(status) {
  return status === '이수'
}

function makeTitleRoleEducationData(eduData, userData, displayedEducationIds) {
  const roleByUid = new Map(
    userData.map((user) => [String(user.uid), user.role || '기타']),
  )
  roleByUid.forEach((role, uid) => roleByUid.set(uid, normalizeRole(role)))

  return eduData.filter((course) => {
    if (!displayedEducationIds.includes(Number(course.education_id))) return false
    const attendees = Array.isArray(course.attendees) ? course.attendees : []
    const educationTitle = course.title || attendees[0]?.education_title || ''

    return !educationTitle.toLowerCase().includes('veo')
  }).flatMap((course) => {
    const roleGroups = new Map()
    const attendees = Array.isArray(course.attendees) ? course.attendees : []
    const educationTitle = course.title || attendees[0]?.education_title || `교육 ${course.education_id}`

    attendees.forEach((attendee) => {
      const role = roleByUid.get(String(attendee.uid)) || '기타'
      const normalizedRole = normalizeRole(role)
      const key = `${course.education_id}-${normalizedRole}`
      const current = roleGroups.get(key) ?? {
        id: key,
        education_id: course.education_id,
        title: educationTitle,
        role: normalizedRole,
        type: educationTitle,
        chartLabel: educationTitle,
        createdAt: course.created_at || course.createdAt || course.updated_at || course.education_id || 0,
        total: 0,
        trained: 0,
        untrained: 0,
      }

      current.total += 1
      if (isHomeCompletedStatus(attendee.status)) {
        current.trained += 1
      } else {
        current.untrained += 1
      }

      roleGroups.set(key, current)
    })

    return [...roleGroups.values()]
  })
}

function makeEducationChartData(countData, eduData, displayedEducationIds) {
  const knownRoles = new Set(countData.map((item) => item.role))
  const roles = [
    ...ROLE_ORDER,
    ...[...knownRoles].filter((role) => !ROLE_ORDER.includes(role)).sort(),
  ]
  const chartRows = new Map(
    displayedEducationIds.flatMap((educationId) => {
      const course = eduData.find((item) => Number(item.education_id) === educationId)
      const attendees = Array.isArray(course?.attendees) ? course.attendees : []
      const title = course?.title || attendees[0]?.education_title

      if (!title) return []

      return [[educationId, {
        title,
        educationId,
        createdAt: educationId,
        details: {},
      }]]
    }),
  )
  countData.forEach((item) => {
    const educationId = Number(item.education_id)
    const current = chartRows.get(educationId) ?? {
      title: item.title,
      educationId,
      createdAt: item.createdAt,
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

    chartRows.set(educationId, current)
  })

  return {
    roles,
    chartData: displayedEducationIds
      .map((educationId) => chartRows.get(educationId))
      .filter(Boolean),
  }
}

function EducationTitleTick({ x, y, payload }) {
  const title = String(payload.value)
  const label = title.length > 12 ? `${title.slice(0, 12)}…` : title

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{title}</title>
      <text textAnchor="end" fill="#64748b" fontSize={11} fontWeight={700} transform="rotate(-28)">{label}</text>
    </g>
  )
}

function EducationTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload
  const role = payload[0]?.dataKey
  const detail = row?.details?.[role] ?? {}
  const roleColor = ROLE_COLORS[role] ?? payload[0]?.fill ?? '#64748b'

  return (
    <div className="education-chart-tooltip">
      <strong>{label}</strong>
      <span className="education-tooltip-role" style={{ color: roleColor }}>{role}</span>
      <hr />
      <span>대상 : {detail.total ?? 0}명</span>
      <span>이수 : {detail.trained ?? 0}명/{detail.total ?? 0}명</span>
      <span>이수율 : {detail.completionRate ?? 0}%</span>
    </div>
  )
}

function EducationLegend({ roles, translate }) {
  return (
    <ul className="education-chart-legend">
      {roles.map((role, index) => (
        <li key={role} style={{ color: ROLE_COLORS[role] ?? ['#3974c6', '#f59e0b', '#10b981', '#8b5cf6'][index % 4] }}>
          <i />
          {translate(role)}
        </li>
      ))}
    </ul>
  )
}

function EducationPieChart({ eduData, userData, useLatestCourses = false }) {
  const navigate = useNavigate()
  const { t } = useUiLanguage()
  const displayedEducationIds = getDisplayedEducationIds(eduData, useLatestCourses)
  const countData = makeTitleRoleEducationData(eduData, userData, displayedEducationIds)
  const { chartData, roles } = makeEducationChartData(countData, eduData, displayedEducationIds)
  const roleColors = ['#3974c6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#64748b']

  return (
    <Box className="edu-card compact-card">
      <div className="education-chart-heading">
        <div>
          <Typography variant="h6">{t('교육 이수 현황')}</Typography>
          <p>{t('대상자별 이수 인원을 확인합니다.')}</p>
        </div>
      </div>

      <Box className="chart-body donut-chart-body education-completion-chart">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{
              top: 16,
              right: 8,
              left: 0,
              bottom: 24,
            }}
          >
            <CartesianGrid vertical={false} stroke="#e7edf5" strokeDasharray="4 4" />
            <XAxis
              dataKey="title"
              height={54}
              interval={0}
              tick={({ x, y, payload }) => {
                const title = String(payload.value)
                return <g transform={`translate(${x},${y})`}><title>{title}</title><text x={0} y={8} textAnchor="middle" fill="#8fa1b8" fontSize={10} fontWeight={700}>{title.length > 13 ? `${title.slice(0, 13)}…` : title}</text></g>
              }}
              tickLine={false}
            />
            <YAxis
              yAxisId="rate"
              width={42}
              allowDecimals={false}
              axisLine={false}
              domain={[0, 100]}
              tick={{ fill: '#8fa1b8', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
            />
            <Tooltip content={<EducationTooltip />} cursor={{ fill: 'rgba(47, 100, 183, 0.04)' }} shared={false} />
            <Legend content={<EducationLegend roles={roles} translate={t} />} />
            {roles.map((role, index) => (
              <Bar
                dataKey={role}
                name={t(role)}
                yAxisId="rate"
                fill={ROLE_COLORS[role] ?? roleColors[index % roleColors.length]}
                key={role}
                radius={[7, 7, 0, 0]}
                barSize={22}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* <EducationTable lists={countData} /> */}

      <div className="Page-move-wrapper">
        <button className="Page-move-button" type="button" onClick={() => navigate('/education')}>
          {t('교육 이수 페이지로 이동')}
        </button>
      </div>
    </Box>
  )
}

export default EducationPieChart
