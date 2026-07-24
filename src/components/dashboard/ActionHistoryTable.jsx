
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'


function filterEvents(lists) {
  return lists.filter(
    (list) =>
      list.status === '조치 완료' ||
      list.status === '조치 중'
  )
}

function ActionHistoryTable({ lists }) {

const ActionHistorydata= filterEvents(lists)

  return (

      <Box className="dashboard-card compact-card">
        <Typography variant="h6">조치 승인 요청</Typography>
    <TableContainer className="events-table-wrap">
      <Table size="small" aria-label="조치 승인 요청">
        <TableHead>
          <TableRow>
            <TableCell>요청일</TableCell>
            <TableCell>위치</TableCell>
            <TableCell>내용</TableCell>
            <TableCell>담당관리자</TableCell>
            <TableCell>상태</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ActionHistorydata.map((data) => (
            <TableRow hover key={data.time} className="event-row">
                <TableCell>{data.time}</TableCell>
                <TableCell>{data.location}</TableCell>
                <TableCell>{data.type}</TableCell>
                <TableCell>{data.manager}</TableCell>
                <TableCell>{data.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  )
}


export default ActionHistoryTable
