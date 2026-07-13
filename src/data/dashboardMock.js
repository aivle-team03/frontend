export const summaryCards = [
  {
    title: '실시간 감지',
    value: 3,
    change: 1,
    description: '실시간으로 감지된 수',
  },
  {
    title: '안전 수칙 위반',
    value: 13,
    change: 3,
    description: '위반 수칙 감지된 항목의 수',
  },
  {
    title: '조치 대기',
    value: 5,
    change: 1,
    description: '안전 수칙 위반 항목 중 조치가 완료 되지 않은 항목의 수',
  },
  {
    title: '조치 완료',
    value: 20,
    change: 1,
    description: '처리 완료 된 전체 항목',
  },
]

export const recentEvents = [
  { time: '00:00:00', location: '1구역', type: '화재 발생', status: '조치 대기' },
  { time: '00:30:13', location: '1구역', type: '화재 발생', status: '조치 완료' },
  { time: '01:00:00', location: '2구역', type: '적재물', status: '조치 대기' },
  { time: '01:00:20', location: '2구역', type: '적재물', status: '조치 완료' },
  { time: '03:00:00', location: '3구역', type: '연기', status: '조치 대기' },
]

export const areaRisks = [
  { area: '1구역', value: 58 },
  { area: '2구역', value: 72 },
  { area: '3구역', value: 44 },
  { area: '4구역', value: 72 },
]

export const analysisItems = [
  { label: '가장 많이 발생한 위험 유형', value: '화재 발생' },
  { label: '위험도가 가장 높은 구역', value: '2구역' },
  { label: '평균 조치 소요시간', value: '42분' },
  { label: '오늘의 조치 완료율', value: '80%' },
]
