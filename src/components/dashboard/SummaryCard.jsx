import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import SensorsIcon from '@mui/icons-material/Sensors'
import { Box, Card, CardActionArea, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

const iconMap = {
  realtime: SensorsIcon,
  violation: ReportProblemOutlinedIcon,
  pending: PendingActionsIcon,
  complete: CheckCircleOutlineIcon,
}

function SummaryCard({ item, isSelected, onSelect }) {
  const Icon = iconMap[item.id] ?? SensorsIcon
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let frameId
    const startTime = performance.now()
    const duration = 720

    const animateValue = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      setDisplayValue(Math.round(item.value * easedProgress))
      if (progress < 1) frameId = requestAnimationFrame(animateValue)
    }

    frameId = requestAnimationFrame(animateValue)
    return () => cancelAnimationFrame(frameId)
  }, [item.value])

  return (
    <Card className={`summary-card summary-${item.id}${isSelected ? ' is-selected' : ''}`}>
      <CardActionArea onClick={() => onSelect(item.id)} className="summary-action">
        <div className="summary-heading">
          <Box className="summary-icon">
            <Icon fontSize="small" />
          </Box>
          <Typography variant="subtitle2" className="summary-title">
            {item.title}
          </Typography>
        </div>
        <div className="summary-value-wrap">
          <Typography className="summary-value">{displayValue}</Typography>
        </div>
        <div className="summary-footer">
          <span className="summary-change">
            <ArrowUpwardIcon fontSize="inherit" />
            {item.change}
          </span>
          <span className="summary-description">{item.description}</span>
        </div>
      </CardActionArea>
    </Card>
  )
}

export default SummaryCard
