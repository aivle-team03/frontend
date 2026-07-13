import { Box, Typography } from '@mui/material'

function AiSummaryCard() {
  return (
    <Box className="ai-summary-card" id="ai-summary">
      <Typography variant="h6">요약</Typography>
      <Typography className="ai-summary-text">
        전반적으로 소방 안전 상태가 양호합니다. 일부 구역에서 경미한 위험 요인이
        감지되었지만 즉시 조치가 필요한 사항은 없습니다. 정기 점검 및 관리가
        적절히 이루어지고 있습니다.
      </Typography>
    </Box>
  )
}

export default AiSummaryCard
