import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import CloseIcon from '@mui/icons-material/Close'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import {
  Box,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

function EventTypeIcon({ type }) {
  if (type === '화재 발생') return <LocalFireDepartmentIcon fontSize="small" />
  if (type === '적재물') return <Inventory2OutlinedIcon fontSize="small" />
  return <CloudOutlinedIcon fontSize="small" />
}

function RecentEventsTable({ events, selectedEvent, onSelectEvent, onClose }) {
  return (
    <>
      <Box className="dashboard-card compact-card">
        <Typography variant="h6">최근 이상 발생 리스트</Typography>
        <TableContainer className="events-table-wrap">
          <Table size="small" aria-label="최근 이상 발생 리스트">
            <TableHead>
              <TableRow>
                <TableCell>시간</TableCell>
                <TableCell>위치</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  hover
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="event-row"
                >
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Box className="event-type-icon">
                        <EventTypeIcon type={event.type} />
                      </Box>
                      <span>{event.type}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>{event.manager}</TableCell>
                  <TableCell>
                    <Chip
                      label={event.status}
                      size="small"
                      color={event.status === '조치 완료' ? 'success' : 'warning'}
                      variant="outlined"
                      className="status-chip"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Drawer anchor="right" open={Boolean(selectedEvent)} onClose={onClose}>
        <Box className="event-drawer" role="presentation">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">이상 발생 상세</Typography>
            <IconButton aria-label="상세 닫기" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          {selectedEvent && (
            <Stack spacing={1.6} className="event-detail-list">
              <Detail label="감지 시간" value={selectedEvent.time} />
              <Detail label="위치" value={selectedEvent.location} />
              <Detail label="위험 유형" value={selectedEvent.type} />
              <Detail label="현재 상태" value={selectedEvent.status} />
              <Detail label="담당자" value={selectedEvent.manager} />
            </Stack>
          )}
        </Box>
      </Drawer>
    </>
  )
}

function Detail({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={800}>{value}</Typography>
    </Box>
  )
}

export default RecentEventsTable
