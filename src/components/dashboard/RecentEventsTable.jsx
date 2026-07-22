import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import CloseIcon from '@mui/icons-material/Close'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
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
                  selected={selectedEvent?.id === event.id}
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="event-row"
                  tabIndex={0}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                      keyboardEvent.preventDefault()
                      onSelectEvent(event)
                    }
                  }}
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

      <Drawer className="event-detail-drawer" anchor="right" open={Boolean(selectedEvent)} onClose={onClose}>
        <Box className="event-drawer" role="presentation">
          <div className="event-drawer-header">
            <div>
              <span>DETECTION DETAIL</span>
              <Typography variant="h6">이상 발생 상세</Typography>
            </div>
            <IconButton className="event-drawer-close" aria-label="상세 닫기" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
          {selectedEvent && (
            <>
              <div className={`event-drawer-summary${selectedEvent.status === '조치 완료' ? ' is-complete' : ''}`}>
                <span className="event-drawer-type-icon">
                  {selectedEvent.status === '조치 완료' ? <CheckCircleRoundedIcon /> : <WarningAmberRoundedIcon />}
                </span>
                <div>
                  <span>{selectedEvent.status === '조치 완료' ? '처리가 완료된 이벤트' : '확인이 필요한 이벤트'}</span>
                  <strong>{selectedEvent.type}</strong>
                </div>
                <Chip
                  label={selectedEvent.status}
                  size="small"
                  color={selectedEvent.status === '조치 완료' ? 'success' : 'warning'}
                  className="event-drawer-status"
                />
              </div>

              <div className="event-detail-list">
                <Detail icon={<AccessTimeRoundedIcon />} label="감지 시간" value={selectedEvent.time} />
                <Detail icon={<LocationOnOutlinedIcon />} label="감지 위치" value={selectedEvent.location} />
                <Detail icon={<EventTypeIcon type={selectedEvent.type} />} label="위험 유형" value={selectedEvent.type} />
                <Detail icon={<PersonOutlineRoundedIcon />} label="담당자" value={selectedEvent.manager} />
              </div>

              <div className="event-drawer-guidance">
                <strong>{selectedEvent.status === '조치 완료' ? '조치가 완료되었습니다.' : '현장 상태를 확인해 주세요.'}</strong>
                <p>{selectedEvent.status === '조치 완료' ? '조치 이력에서 처리 내용을 확인할 수 있습니다.' : '담당자 배정 후 안전 조치를 진행할 수 있습니다.'}</p>
              </div>
            </>
          )}
        </Box>
      </Drawer>
    </>
  )
}

function Detail({ icon, label, value }) {
  return (
    <div className="event-detail-item">
      <span className="event-detail-item-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

export default RecentEventsTable
