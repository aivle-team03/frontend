import { useEffect, useMemo, useState } from 'react'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
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
import { useNavigate } from 'react-router-dom'

function EventTypeIcon({ type }) {
  if (type === '화재 발생') return <LocalFireDepartmentIcon fontSize="small" />
  if (type === '적재물') return <Inventory2OutlinedIcon fontSize="small" />
  return <CloudOutlinedIcon fontSize="small" />
}

function isCompleteStatus(status) {
  return status === '조치 완료' || status === '점검 완료'
}

function isPendingStatus(status) {
  return status === '조치 대기'
}

function shouldShowAssignmentButton(status) {
  const normalizedStatus = String(status ?? '').replace(/\s/g, '')

  return normalizedStatus.includes('점검대기')
    || normalizedStatus.includes('조치대기')
    || isPendingStatus(status)
}

function filterEventsBySummary(events, selectedSummaryID) {
  if (selectedSummaryID === 'realtime') {
    return events.filter((event) => event.status === '점검 대기')
  }
  if (selectedSummaryID === 'pending') {
    return events.filter((event) => isPendingStatus(event.status))
  }
  if (selectedSummaryID === 'complete') {
    return events.filter((event) => event.status === '조치 완료')
  }
  if (selectedSummaryID === 'violation') {
    return events.filter((event) => event.status ===  '점검 완료')
  }
  return events
}

function RecentEventsTable({ events = [], selectedSummaryID, selectedEvent, onSelectEvent, onClose }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const pageSize = 8
  const filteredEvents = useMemo(
    () => filterEventsBySummary(events, selectedSummaryID),
    [events, selectedSummaryID],
  )
  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize))
  const activePage = Math.min(page, pageCount - 1)
  const visibleEvents = filteredEvents.slice(activePage * pageSize, activePage * pageSize + pageSize)

  useEffect(() => {
    setPage(0)
  }, [selectedSummaryID, events])

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
              {visibleEvents.map((event, index) => (
                <TableRow
                  hover
                  selected={selectedEvent?.id === event.id}
                  key={`${event.status}-${event.time}-${event.location}-${event.type}-${index}`}
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
                      color={isCompleteStatus(event.status) ? 'success' : 'warning'}
                      variant="outlined"
                      className="status-chip"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <footer className="checklist-pagination recent-events-pagination">
          <span>총 <strong>{filteredEvents.length}</strong>건</span>
          <div>
            <button type="button" aria-label="이전 이벤트 목록" disabled={activePage === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
              <ChevronLeftRoundedIcon />
            </button>
            <b>{activePage + 1} / {pageCount}</b>
            <button type="button" aria-label="다음 이벤트 목록" disabled={activePage === pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>
              <ChevronRightRoundedIcon />
            </button>
          </div>
        </footer>
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
              <div className={`event-drawer-summary${isCompleteStatus(selectedEvent.status) ? ' is-complete' : ''}`}>
                <span className="event-drawer-type-icon">
                  {isCompleteStatus(selectedEvent.status) ? <CheckCircleRoundedIcon /> : <WarningAmberRoundedIcon />}
                </span>
                <div>
                  <span>{isCompleteStatus(selectedEvent.status) ? '처리가 완료된 이벤트' : '확인이 필요한 이벤트'}</span>
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
                <strong>{isCompleteStatus(selectedEvent.status) ? '처리가 완료되었습니다.' : '현장 상태를 확인해 주세요.'}</strong>
                <p>{isCompleteStatus(selectedEvent.status) ? '상세 이력에서 처리 내용을 확인할 수 있습니다.' : '담당자 배정 후 안전 조치를 진행할 수 있습니다.'}</p>
              </div>
              {shouldShowAssignmentButton(selectedEvent.status) && (
                <div className="Page-move-wrapper event-drawer-action">
                  <button className="Page-move-button" type="button" onClick={() => navigate('/checklists/management')}>
                    담당자배정 페이지로 이동
                  </button>
                </div>
              )}
              {isCompleteStatus(selectedEvent.status) && (
                <div className="Page-move-wrapper event-drawer-action">
                  <button className="Page-move-button" type="button" onClick={() => navigate('/actions')}>
                    조치 이력 페이지로 이동
                  </button>
                </div>
              )}
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
