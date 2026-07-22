
import {

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
} from '@mui/material'



function makePercentData(lists) {
    return lists.map((list) => ({
    type: list.type,
    total: list.total,
    trained: list.trained,
    percent: Number(((list.trained / list.total) * 100).toFixed(1)),
    }))
}

  
function EducationTable({ lists }) {

const percentData= makePercentData(lists);
  return (
    <TableContainer className="events-table-wrap">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>유형</TableCell>
            <TableCell>대상</TableCell>
            <TableCell>이수현황</TableCell>
            <TableCell>이수율</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {percentData.map((data) => (
            <TableRow hover key={data.type} className="event-row">
                    <TableCell>{data.type}</TableCell>
                    <TableCell>{data.total}</TableCell>
                    <TableCell> {data.trained}</TableCell>
                    <TableCell> {data.percent}%</TableCell>             
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}


export default EducationTable
