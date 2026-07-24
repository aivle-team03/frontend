import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import EngineeringIcon from '@mui/icons-material/Engineering'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'

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

const riskOptions = ['상', '중', '하']
const numberOptions = Array.from({ length: 9 }, (_, index) => index + 1)

function EventTypeIcon({ type }) {
  if (type === '화재') return <LocalFireDepartmentIcon fontSize="small" />
  if (type === '적재물') return <Inventory2OutlinedIcon fontSize="small" />
  if (type === '안전모') return <EngineeringIcon fontSize="small" />
  if (type === '충돌') return <DirectionsCarIcon fontSize="small" />
  return <CloudOutlinedIcon fontSize="small" />
}

function EventCategoryTable({ events, isEditMode = false, onUpdate }) {
  const updateRiskValue = (riskId, field, value) => {
    const nextValue = field === 'risk' ? value : Number(value)
    onUpdate?.(riskId, field, nextValue)
  }

  return (
    <div className="risk-table-panel">
      <TableContainer className="events-table-wrap">
        <Table size="small" aria-label="위험 요인 리스트">
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
            {events.map((event) => (
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
                <TableCell>
                  {isEditMode ? (
                    <label className="risk-severity-select">
                      <select
                        aria-label={`${event.item} 위험도 변경`}
                        value={event.risk}
                        onChange={(eventChange) => updateRiskValue(event.id, 'risk', eventChange.target.value)}
                      >
                        {riskOptions.map((risk) => (
                          <option key={risk} value={risk}>{risk}</option>
                        ))}
                      </select>
                    </label>
                  ) : event.risk}
                </TableCell>
                <TableCell>
                  {isEditMode ? (
                    <label className="risk-severity-select">
                      <select
                        aria-label={`${event.item} 강도 변경`}
                        value={event.severity}
                        onChange={(eventChange) => updateRiskValue(event.id, 'severity', eventChange.target.value)}
                      >
                        {numberOptions.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  ) : event.severity}
                </TableCell>
                <TableCell>
                  {isEditMode ? (
                    <label className="risk-severity-select">
                      <select
                        aria-label={`${event.item} 빈도 변경`}
                        value={event.frequency}
                        onChange={(eventChange) => updateRiskValue(event.id, 'frequency', eventChange.target.value)}
                      >
                        {numberOptions.map((value) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  ) : event.frequency}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default EventCategoryTable
