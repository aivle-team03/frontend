import { Box } from '@mui/material'
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
  if (value == "소방") return '#f76773'
  if (value == "시설") return '#4ad661'
  if (value == "안전") return '#4bc1df'
  if (value == "전체") return '#ccf70e'
  return '#000000'
}

function makeTypeCountData(risks) {
  const countMap = {}
  risks.forEach((risk) => {
    countMap[risk.type] = (countMap[risk.type] || 0) + 1
  })

const typeData = Object.entries(countMap).map(([type, count]) => ({
    type,
    count,
  }))

  typeData.push({
    type: "전체",
    count: risks.length,
  })

  return typeData
}


function RiskFactorTypeChart({ risks }) {

const chartData = makeTypeCountData(risks);


  return (
    
    <Box >
      <Box className="risk-chart">
        <ResponsiveContainer width="90%" height={200}>
          <BarChart data={chartData}  margin={{ top: 6, right: 28, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <YAxis dataKey="count" allowDecimals={false}/>
            <XAxis dataKey="type"  width={20} />
            <Tooltip formatter={(value) => [`${value}`, '개수']} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} isAnimationActive animationBegin={120} animationDuration={1100} animationEasing="ease-out">
              {chartData.map((data) => (
                <Cell
                  cursor="pointer"
                  fill={getRiskColor(data.type)}
                  key={data.type}
                
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

export default RiskFactorTypeChart
