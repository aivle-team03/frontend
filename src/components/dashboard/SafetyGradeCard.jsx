import { Box, Stack, Typography } from '@mui/material'
import safetyShieldImage from '../../assets/safety-shield.png'

function SafetyGradeCard() {
  return (
    <Box className="safety-grade-card">
      <Stack className="grade-stack" direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
        <img src={safetyShieldImage} alt="" aria-hidden="true" className="grade-shield" />
        <Box className="grade-copy">
          <Typography>종합 안전 등급</Typography>
          <strong>A</strong>
        </Box>
      </Stack>
    </Box>
  )
}

export default SafetyGradeCard
