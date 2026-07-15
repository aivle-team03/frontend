import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  
} from '@mui/material'

function EventTypeIcon({ type }) {
  if (type === '화재 발생') return <LocalFireDepartmentIcon fontSize="small" />
  if (type === '적재물') return <Inventory2OutlinedIcon fontSize="small" />
  return <CloudOutlinedIcon fontSize="small" />
}

function RecentEventsTableMonitoring({ events }) {
  return (
    <>
        <TableContainer className="events-table-wrap">
          <Table size="small" aria-label="최근 이상 발생 리스트">
            <TableHead>
              <TableRow>
                <TableCell>시간</TableCell>
                <TableCell>위치</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  hover
                  key={event.id}
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
    

  
    </>
  )
}


export default RecentEventsTableMonitoring
