import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import EngineeringIcon from '@mui/icons-material/Engineering'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { useState } from 'react'

import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

function EventTypeIcon({ type }) {
  if (type === '화재') return <LocalFireDepartmentIcon fontSize="small" />
  if (type === '적재물') return <Inventory2OutlinedIcon fontSize="small" />
  if (type === '안전모') return <EngineeringIcon fontSize="small" />
  if (type === '충돌') return <DirectionsCarIcon fontSize="small" />
  return <CloudOutlinedIcon fontSize="small" />
}

function EventCategoryTable({ events }) {

  const [eventscategory, setEventsCategory] = useState(events)
  function handleSeverityChange(id, value) {

    setEventsCategory((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              severity: Number(value)
            }
          : event
      )
    )

  }
  return (
    <TableContainer className="events-table-wrap">
      <Table size="small" aria-label="최근 이상 발생 리스트">
        <TableHead>
          <TableRow>
            <TableCell>유형</TableCell>
            <TableCell>항목</TableCell>
            <TableCell>위험도</TableCell>
            <TableCell>강도</TableCell>
            <TableCell>빈도</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {eventscategory.map((event) => (
            <TableRow hover key={event.id} className="event-row">
                  <TableCell>{event.type}</TableCell>
                    <TableCell>
                                      <Stack direction="row" spacing={0.8} alignItems="center">
                                        <Box className="event-type-icon">
                                          <EventTypeIcon type={event.item} />
                                        </Box>
                                        <span>{event.item}</span>
                                      </Stack>
                                    </TableCell>
                  <TableCell> {event.risk}</TableCell>
                  <TableCell>
                    <label className="risk-severity-select">
                      <select
                        aria-label={`${event.item} 강도 변경`}
                        value={event.severity}
                        onChange={(e)=>handleSeverityChange(event.id, e.target.value)}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                      </select>
                    </label>             
                  </TableCell>
                  <TableCell> {event.frequency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}


export default EventCategoryTable
