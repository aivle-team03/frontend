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
    <Box className="edu-card">
      <Typography variant="h6">교육 이수 현황</Typography>
      <Box className="chart-body donut-chart-body">
        <ResponsiveContainer width="100%" height={300}>
           <BarChart
              responsive
              data={countData}
              margin=
              {{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
              }}
    >
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis dataKey="type" type="category" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Bar dataKey="total" fill="#e7b0b5" activeBar={{ fill: 'pink', stroke: 'blue' }} radius={[10, 10, 0, 0]} barSize={30} />
      <Bar dataKey="trained" fill="#f1d19b" activeBar={{ fill: 'gold', stroke: 'purple' }} radius={[10, 10, 0, 0]} barSize={30} />
    </BarChart>
        </ResponsiveContainer>
      </Box>
      {/* <div className="donut-legend">
        {data.map((item, index) => (
          <div className="donut-legend-item" key={item.type}>
            <span>
              <i style={{ backgroundColor: colors[index % colors.length] }}></i>
              {item.type}
            </span>
            <strong>{item.percent}%</strong>
          </div>
        ))}
      </div> */}

      <EducationTable lists={countData}></EducationTable>
    </Box>
  )}


//   return (
//     <Box className="edu-card">
//       <Typography variant="h6">교육 이수 현황</Typography>
//       <Box className="chart-body donut-chart-body">
//         <ResponsiveContainer width="100%" height={200}>
//           <PieChart>
//             <Pie data={countdata} dataKey="percent" nameKey="type" innerRadius={0} outerRadius={88} paddingAngle={3} isAnimationActive animationBegin={180} animationDuration={1100} animationEasing="ease-out">
//               {countdata.map((entry, index) => (
//                 <Cell key={entry.type} fill={colors[index % colors.length]} />
//               ))}
//             </Pie>
//             <Tooltip formatter={(value,name) => [`${value}%`, name]} />
//           </PieChart>
//         </ResponsiveContainer>
//       </Box>
//       <div className="donut-legend">
//         {countdata.map((item, index) => (
//           <div className="donut-legend-item" key={item.type}>
//             <span>
//               <i style={{ backgroundColor: colors[index % colors.length] }}></i>
//               {item.type}
//             </span>
//             <strong>{item.percent}%</strong>
//           </div>
//         ))}
//       </div>

//       <EducationTable lists={data}></EducationTable>
//     </Box>
//   )
// }

export default EducationPieChart
