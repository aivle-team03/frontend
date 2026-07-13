import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import { Box, Stack, Typography } from '@mui/material'

const icons = [LocalFireDepartmentIcon, PlaceOutlinedIcon, AccessTimeIcon, CheckCircleOutlineIcon]

function AnalysisOverview({ items }) {
  return (
    <Box className="analysis-card">
      <Typography variant="h6">주요 분석 내용</Typography>
      <Box className="analysis-list">
        {items.map((item, index) => {
          const Icon = icons[index] ?? LocalFireDepartmentIcon

          return (
            <Box className={`analysis-item tone-${index + 1}`} key={item.label}>
              <Stack direction="row" spacing={1.2} alignItems="flex-start">
                <Box className="analysis-icon">
                  <Icon fontSize="small" />
                </Box>
                <Box>
                  <Typography className="analysis-label">{item.label}</Typography>
                  <Typography className="analysis-value">{item.value}</Typography>
                  <Typography className="analysis-description">{item.description}</Typography>
                </Box>
              </Stack>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default AnalysisOverview
