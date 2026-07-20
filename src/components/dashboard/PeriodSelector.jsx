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

const defaultPeriodOptions = ['오늘', '최근 7일', '이번 달', '지난 달', '직접 설정']

function PeriodSelector({
  selectedPeriod,
  onSelectPeriod,
  onApplyCustomPeriod,
  options = defaultPeriodOptions,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateError, setDateError] = useState('')

  const handleChange = (_, value) => {
    if (!value) return
    onSelectPeriod(value)
    if (value === '직접 설정') {
      setDateError('')
      setIsDialogOpen(true)
    }
  }

  const handleApply = () => {
    if (!startDate || !endDate) {
      setDateError('시작일과 종료일을 모두 선택해 주세요.')
      return
    }

    if (startDate > endDate) {
      setDateError('종료일은 시작일보다 빠를 수 없습니다.')
      return
    }

    onApplyCustomPeriod?.({ startDate, endDate })
    setIsDialogOpen(false)
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
        {options.map((option) => (
          <ToggleButton
            key={option}
            value={option}
            aria-label={option}
            title={option}
            onClick={() => {
              if (option === '직접 설정') {
                setDateError('')
                setIsDialogOpen(true)
              }
            }}
          >
            {option === '직접 설정' ? <CalendarMonthIcon fontSize="small" /> : option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>직접 설정</DialogTitle>
        <DialogContent>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <DateField label="시작일" value={startDate} onChange={setStartDate} />
            <DateField label="종료일" value={endDate} onChange={setEndDate} />
            {dateError && <Typography className="date-field-error">{dateError}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>닫기</Button>
          <Button variant="contained" onClick={handleApply}>
            적용
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function DateField({ label, value, onChange }) {
  return (
    <div className="date-field">
      <Typography component="label" className="date-field-label">
        {label}
      </Typography>
      <input
        type="date"
        className="date-input"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default PeriodSelector
