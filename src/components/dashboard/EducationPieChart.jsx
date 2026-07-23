import { Box, Typography } from '@mui/material'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import EducationTable from './EducationTable.jsx'

//2안
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
const colors = ['#e7b0b5', '#f1d19b', '#b8cbe0', '#8eb6df']


function makeTypeCountData(data) {
  
  const total = data.reduce((sum, item) => sum + item.total, 0)
  const trained = data.reduce((sum, item) => sum + item.trained, 0)

  return [
    {
        type: '전체 근로자',
        total: total,
        trained: trained,
        percent: Number(((trained / total) * 100).toFixed(1)),
    }
  ]

}


function EducationPieChart({ data }) {

  const countData = [
    ...data,
    ...makeTypeCountData(data),
  ];
  return (
    <Box className="edu-card compact-card">
      <Typography variant="h6">교육 이수 현황</Typography>
      <Box className="chart-body donut-chart-body">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
              responsive
              data={countData}
              margin=
              {{
                top: 3,
                right: 0,
                left: 0,
                bottom: 5,
              }}
    >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="type" type="category" />
            <YAxis width="auto"   domain={[0, Math.max(...countData.map(item => item.total)) + 50]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#e7b0b5" activeBar={{ fill: 'pink', stroke: 'blue' }} radius={[10, 10, 0, 0]} barSize={30} />
            <Bar dataKey="trained" fill="#f1d19b" activeBar={{ fill: 'gold', stroke: 'purple' }} radius={[10, 10, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <EducationTable lists={countData}></EducationTable>
      
        <div className="Page-move-wrapper">
          <button className="Page-move-button" type="button">
            교육 이수 페이지로 이동
          </button>
        </div>

    </Box>
  )}

export default EducationPieChart
