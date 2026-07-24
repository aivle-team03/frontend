import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import EngineeringIcon from '@mui/icons-material/Engineering'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'

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

// events = [] 기본값을 지정하여 비동기 데이터 로딩 중 crash 방지
function EventCategoryTable({
  events = [],
  onLevelChange,
  selectedCategoryId,
  onSelectCategory,
}) {
  // 안전하게 배열 검사
  const safeEvents = Array.isArray(events) ? events : []

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
          {safeEvents.length > 0 ? (
            safeEvents.map((event) => {
              // 백엔드 필드명 매핑 (없을 경우를 대비한 fallback)
              const id = event.category_id || event.id
              const category = event.category || event.type
              const categoryName = event.category_name || event.item
              const riskLevel = event.risk_level || event.risk
              const level = event.level || event.severity || 1
              const frequency = event.frequency ?? 0

              const isSelected = selectedCategoryId === id

              return (
                <TableRow
                  hover
                  key={id}
                  className={`event-row ${isSelected ? 'selected-row' : ''}`}
                  onClick={() => onSelectCategory && onSelectCategory(id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f0f7ff' : 'transparent',
                  }}
                >
                  {/* 1. 유형 (소방, 시설, 안전 등) */}
                  <TableCell>{category}</TableCell>

                  {/* 2. 항목 (화재, 적재물 등) + 아이콘 */}
                  <TableCell>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Box className="event-type-icon">
                        <EventTypeIcon type={categoryName} />
                      </Box>
                      <span>{categoryName}</span>
                    </Stack>
                  </TableCell>

                  {/* 3. 실시간 계산된 위험도 ('상', '중', '하') */}
                  <TableCell>{riskLevel}</TableCell>

                  {/* 4. 강도 선택 드롭다운 (1~10) */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={level}
                      size="small"
                      onChange={(e) =>
                        onLevelChange && onLevelChange(id, e.target.value)
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* 5. 빈도 */}
                  <TableCell>{frequency}</TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" style={{ padding: '20px' }}>
                등록된 위험 요인 데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default EventCategoryTable