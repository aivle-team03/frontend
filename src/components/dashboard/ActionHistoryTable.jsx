
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
      list.approval_status === '승인 대기'
  )
}

function formatTime(value) {
  if (!value) return '-'
  return String(value).replace('T', ' ')
}

function ActionHistoryTable({ lists }) {

const ActionHistorydata= filterEvents(lists)

  return (

      <Box>
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
            <TableRow hover key={data.action_history_id ?? data.completed_at} className="event-row">
                <TableCell>{formatTime(data.created_at)}</TableCell>
                <TableCell>{data.location}</TableCell>
                <TableCell>{data.action_name}</TableCell>
                <TableCell>{data.handler_name}</TableCell>
                <TableCell>{data.approval_status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  )
}


export default ActionHistoryTable
