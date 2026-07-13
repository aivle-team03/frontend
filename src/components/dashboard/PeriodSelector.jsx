import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useState } from 'react'

const periodOptions = ['오늘', '최근 7일', '이번 달', '지난 달', '직접 설정']

function PeriodSelector({ selectedPeriod, onSelectPeriod }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleChange = (_, value) => {
    if (!value) return
    onSelectPeriod(value)
    if (value === '직접 설정') {
      setIsDialogOpen(true)
    }
  }

  return (
    <>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={selectedPeriod}
        onChange={handleChange}
        aria-label="기간 선택"
        className="period-toggle"
      >
        {periodOptions.map((option) => (
          <ToggleButton key={option} value={option}>
            {option === '직접 설정' && <CalendarMonthIcon fontSize="small" />}
            {option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>직접 설정</DialogTitle>
        <DialogContent>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <DateField label="시작일" />
            <DateField label="종료일" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>닫기</Button>
          <Button variant="contained" onClick={() => setIsDialogOpen(false)}>
            적용
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function DateField({ label }) {
  return (
    <div className="date-field">
      <Typography component="label" className="date-field-label">
        {label}
      </Typography>
      <input type="date" className="date-input" aria-label={label} />
    </div>
  )
}

export default PeriodSelector
