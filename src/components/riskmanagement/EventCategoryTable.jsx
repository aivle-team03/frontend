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
  Select,
  MenuItem,
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
                    <Select
                      value={event.severity}
                      size="small"
                      onChange={(e)=>handleSeverityChange(event.id, e.target.value)}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={6}>6</MenuItem>
                      <MenuItem value={7}>7</MenuItem>
                      <MenuItem value={8}>8</MenuItem>
                      <MenuItem value={9}>9</MenuItem>
                    </Select>             
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
