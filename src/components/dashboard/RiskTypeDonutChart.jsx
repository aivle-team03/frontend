import { Box, Typography } from '@mui/material'
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useUiLanguage } from '../../utils/uiLanguage.js'

const riskTypeColors = ['#FBB4AE', '#B3CDE3', '#CCEBC5', '#DECBE4']

function RiskTypeDonutChart({ data }) {
  const { t } = useUiLanguage()
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const chartData = data.map((item) => ({
    ...item,
    percent: total ? Number(((Number(item.value || 0) / total) * 100).toFixed(1)) : 0,
  }))
  return (
    <Box className="chart-card">
      <div className="chart-card-heading">
        <div>
          <Typography variant="h6">{t('위험 유형 비율')}</Typography>
          <Typography className="chart-card-caption">{t('위험도 관리 항목의 구성 비율입니다.')}</Typography>
        </div>
      </div>
      <Box className="chart-body donut-chart-body">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chartData} dataKey="percent" nameKey="name" innerRadius={60} outerRadius={90} cornerRadius={5} paddingAngle={3} stroke="none" isAnimationActive animationBegin={180} animationDuration={1100} animationEasing="ease-out">
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={riskTypeColors[index % riskTypeColors.length]} />
              ))}
              <Label value={t('위험 유형')} position="center" className="donut-center-label" />
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, '비율']} cursor={false} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <div className="donut-legend">
        {chartData.map((item, index) => (
          <div className="donut-legend-item" key={item.name}>
            <span>
              <i style={{ backgroundColor: riskTypeColors[index % riskTypeColors.length] }} />
              {t(item.name)}
            </span>
            <strong>{item.percent}%</strong>
          </div>
        ))}
      </div>
      
    </Box>
  )
}

export default RiskTypeDonutChart
