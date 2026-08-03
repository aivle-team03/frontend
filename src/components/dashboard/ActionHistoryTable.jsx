
import { useEffect, useMemo, useState } from 'react'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
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
  const [page, setPage] = useState(0)
  const pageSize = 8
  const ActionHistorydata = useMemo(() => filterEvents(lists), [lists])
  const pageCount = Math.max(1, Math.ceil(ActionHistorydata.length / pageSize))
  const activePage = Math.min(page, pageCount - 1)
  const visibleActionHistoryData = ActionHistorydata.slice(activePage * pageSize, activePage * pageSize + pageSize)

  useEffect(() => {
    setPage(0)
  }, [lists])

  return (

      <Box className="action-history-table-card">
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
          {visibleActionHistoryData.map((data) => (
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
    <footer className="recent-events-pagination">
      <span>총 <strong>{ActionHistorydata.length}</strong>건</span>
      <div>
        <button type="button" aria-label="이전 조치 승인 요청" disabled={activePage === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
          <ChevronLeftRoundedIcon />
        </button>
        <b>{activePage + 1} / {pageCount}</b>
        <button type="button" aria-label="다음 조치 승인 요청" disabled={activePage === pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>
          <ChevronRightRoundedIcon />
        </button>
      </div>
    </footer>
    </Box>
  )
}


export default ActionHistoryTable
