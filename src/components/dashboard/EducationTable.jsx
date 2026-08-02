
import {

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'



function makePercentData(lists) {
    return lists.map((list) => ({
    id: list.id ?? `${list.education_id}-${list.role}`,
    role: list.role,
    type: list.title ?? list.type,
    total: list.total,
    trained: list.trained,
    untrained: list.untrained,
    status: list.status,
    percent: list.total ? Number(((list.trained / list.total) * 100).toFixed(1)) : 0,
    }))
}

  
function EducationTable({ lists }) {

const percentData= makePercentData(lists);
  return (
    <TableContainer className="events-table-wrap">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Role</TableCell>
            <TableCell>유형</TableCell>
            <TableCell>대상</TableCell>
            <TableCell>이수</TableCell>
            <TableCell>미이수</TableCell>
            <TableCell>이수율</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>
          {percentData.map((data) => (
            <TableRow hover key={data.id} className="event-row">
                    <TableCell>{data.role || '-'}</TableCell>
                    <TableCell>{data.type}</TableCell>
                    <TableCell>{data.total ?? '-'}</TableCell>
                    <TableCell> {data.trained ?? data.status ?? '-'}</TableCell>
                    <TableCell> {data.untrained ?? '-'}</TableCell>
                    <TableCell> {data.total ? `${data.percent}%` : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}


export default EducationTable
