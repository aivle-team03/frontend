export const summaryCards = [
  {
    id: 'realtime',
    title: '실시간 감지',
    value: 3,
    change: 1,
    description: '실시간 감지 건수',
  },
  {
    id: 'violation',
    title: '안전 수칙 위반',
    value: 13,
    change: 3,
    description: '감지된 위반 항목',
  },
  {
    id: 'pending',
    title: '조치 대기',
    value: 5,
    change: 1,
    description: '미완료 조치 항목',
  },
  {
    id: 'complete',
    title: '조치 완료',
    value: 20,
    change: 1,
    description: '완료된 조치 항목',
  },
]

export const recentEvents = [
  { id: 1, time: '00:00:00', location: '1구역', type: '화재 발생', manager: "-",status: '조치 대기' },
  { id: 2, time: '00:30:13', location: '1구역', type: '화재 발생', manager: "김안전",status: '조치 완료' },
  { id: 3, time: '01:00:00', location: '2구역', type: '적재물', manager: "-", status: '조치 대기' },
  { id: 4, time: '01:00:20', location: '2구역', type: '적재물', manager: "이안전", status: '조치 완료' },
  { id: 5, time: '03:00:00', location: '3구역', type: '연기', manager: "-", status: '조치 대기' },
]

export const areaRisks = [
  { area: '1구역', value: 58 },
  { area: '2구역', value: 72 },
  { area: '3구역', value: 44 },
  { area: '4구역', value: 72 },
]

export const periodChartData = {
  오늘: [
    { label: '00시', count: 1 },
    { label: '06시', count: 2 },
    { label: '12시', count: 1 },
    { label: '18시', count: 3 },
  ],
  '최근 7일': [
    { label: '월', count: 5 },
    { label: '화', count: 7 },
    { label: '수', count: 4 },
    { label: '목', count: 8 },
    { label: '금', count: 6 },
    { label: '토', count: 3 },
    { label: '일', count: 4 },
  ],
  '이번 달': [
    { label: '1주', count: 14 },
    { label: '2주', count: 18 },
    { label: '3주', count: 13 },
    { label: '4주', count: 21 },
  ],
  '지난 달': [
    { label: '1주', count: 16 },
    { label: '2주', count: 12 },
    { label: '3주', count: 19 },
    { label: '4주', count: 15 },
  ],
  '직접 설정': [
    { label: '시작', count: 4 },
    { label: '중간', count: 9 },
    { label: '종료', count: 6 },
  ],
}

export const riskTypeData = [
  { name: '화재 발생', value: 42 },
  { name: '적재물', value: 26 },
  { name: '연기', value: 18 },
  { name: '안전 수칙 위반', value: 14 },
]

export const analysisItems = [
  {
    label: '가장 많이 발생한 위험 유형',
    value: '화재 발생',
    description: '최근 이벤트 기준',
  },
  {
    label: '위험도가 가장 높은 구역',
    value: '2구역',
    description: '위험도 72점',
  },
  {
    label: '평균 조치 소요시간',
    value: '42분',
    description: '완료 건 평균',
  },
  {
    label: '오늘의 조치 완료율',
    value: '80%',
    description: '전체 대상 기준',
  },
]
