export const CHECKLIST_MOCK_DATA = {
  '1층 현관': [
    { id: 1, text: '소화기 비치 상태 확인', completed: true },
    { id: 2, text: '비상구 앞 적치물 제거', completed: true },
    { id: 3, text: '방화문 폐쇄 상태 점검', completed: false },
    { id: 4, text: '피난 유도등 점등 확인', completed: false },
  ],
  '2층 복도': [
    { id: 5, text: '복도 적재물 이동 조치', completed: false },
    { id: 6, text: '스프링클러 헤드 점검', completed: false },
  ],
  '지하 주차장': [
    { id: 7, text: '소화전 앞 주차 금지 구역 확인', completed: true },
    { id: 8, text: '화재 감지기 동작 테스트', completed: false },
  ],
}

export const CHATBOT_MOCK_DATA = {
  recommendedQuestions: [
    '소방시설 설치 및 관리에 관한 법률 제12조',
    '물류창고 화재안전 성능기준 NFPC 609',
    '방화문 및 자동방화셔터의 설치 기준',
    '비상구 적치물 위반 시 과태료 규정',
  ],
  botReplies: {
    '소방시설 설치 및 관리에 관한 법률 제12조':
      '소방시설법 제12조는 소방시설의 설치 및 관리에 관한 책무와 특정소방대상물의 규모에 따른 설치 기준을 다룹니다.',
    '물류창고 화재안전 성능기준 NFPC 609':
      '물류창고는 초기 소화가 가능하도록 스프링클러와 경보 설비의 작동 상태를 정기적으로 점검해야 합니다.',
    '방화문 및 자동방화셔터의 설치 기준':
      '방화문은 상시 폐쇄 상태를 유지하거나 화재 감지기와 연동해 자동으로 닫히는 구조여야 합니다.',
    '비상구 적치물 위반 시 과태료 규정':
      '비상구 앞 물건 적재는 피난 동선을 방해하므로 현장 점검 시 즉시 제거 조치가 필요합니다.',
  },
}

export const EDUCATION_MOCK_DATA = {
  content: [
    { id: 'forklift-basics', category: '작업 안전', title: '지게차 작업구역 안전수칙', duration: '05:30', description: '작업 전 작업구역을 확인하고 보행자와 운행 동선을 분리하는 기본 안전수칙을 확인합니다.' },
    { id: 'fire-response', category: '화재 예방', title: '화재 발생 시 초기 대응', duration: '04:10', description: '화재 발생 시 주변에 알리고 대피 및 초기 대응을 진행하는 절차를 확인합니다.' },
    { id: 'conveyor-safety', category: '설비 안전', title: '컨베이어 끼임 예방', duration: '04:50', description: '컨베이어 주변의 위험 구역을 확인하고 끼임 사고를 예방하는 작업 절차를 확인합니다.' },
    { id: 'ppe-basics', category: '보호구', title: '보호구 착용 기본 교육', duration: '03:45', description: '작업 유형에 맞는 보호구를 선택하고 올바르게 착용하는 방법을 확인합니다.' },
    { id: 'chemical-safety', category: '화학물질', title: '화학물질 취급 안전', duration: '04:25', description: '화학물질의 표시와 보관 방법을 확인하고 취급 중 노출 사고를 예방합니다.' },
    { id: 'work-at-height', category: '추락 예방', title: '고소작업 추락 예방', duration: '05:05', description: '고소작업 전 안전대를 점검하고 작업발판과 주변 개구부를 확인합니다.' },
    { id: 'electrical-safety', category: '전기 안전', title: '전기 작업 안전수칙', duration: '03:55', description: '전기 작업 전 전원을 차단하고 감전 위험을 줄이는 기본 절차를 확인합니다.' },
  ],
  requiredCourses: [
    { id: 1, contentId: 'forklift-basics', title: '지게차 작업구역 안전수칙', target: '신규 입사자', deadline: '오늘', status: '진행 중' },
    { id: 2, contentId: 'fire-response', title: '화재 발생 시 초기 대응', target: '전체', deadline: '오늘', status: '미이수' },
    { id: 3, contentId: 'conveyor-safety', title: '컨베이어 끼임 예방', target: '일반 작업자', deadline: '내일', status: '대기' },
    { id: 4, contentId: 'ppe-basics', title: '보호구 착용 기본 교육', target: '특수 작업자', deadline: '이번 주', status: '완료' },
    { id: 5, contentId: 'chemical-safety', title: '화학물질 취급 안전', target: '안전 관리자', deadline: '이번 주', status: '대기' },
    { id: 6, contentId: 'work-at-height', title: '고소작업 추락 예방', target: '특수 작업자', deadline: '다음 주', status: '대기' },
    { id: 7, contentId: 'electrical-safety', title: '전기 작업 안전수칙', target: '안전 관리자', deadline: '다음 주', status: '미이수' },
  ],
  completion: [
    { label: '신규 근로자', value: 92, completed: 23, total: 25 },
    { label: '일반 작업자', value: 78, completed: 39, total: 50 },
    { label: '특수 작업자', value: 85, completed: 34, total: 40 },
    { label: '안전 관리자', value: 65, completed: 13, total: 20 },
    { label: '전체', value: 87, completed: 87, total: 100 },
  ],
  generationOptions: {
    workTypes: ['물류 / 운반', '설비 점검', '화재 예방', '고소 작업'],
    equipment: ['지게차', '컨베이어', '전기 설비', '보호구'],
    risks: ['충돌, 끼임, 낙하', '화재, 폭발', '감전, 추락', '미끄러짐, 전도'],
  },
}

export const MY_PAGE_MOCK_DATA = {
  user: {
    userId: 'user001',
    name: '김에이블러',
    department: '안전관리팀',
    role: '관리자',
    profileImage: '/images/profile.png',
    email: 'kim@aivle.com',
    area: '12 구역',
  },
  workLogs: [
    {
      id: 1,
      userId: 'user001',
      userName: '김에이블러',
      action: '위험요소 조치 완료',
      detail: '방화문 개방 상태 조치 완료',
      time: '2026-07-15 09:45',
    },
    {
      id: 2,
      userId: 'user002',
      userName: '이안전',
      action: '소화기 점검',
      detail: '3층 창고 소화기 점검 완료',
      time: '2026-07-15 08:30',
    },
    {
      id: 3,
      userId: 'user001',
      userName: '김에이블러',
      action: 'AI 위험 알림 확인',
      detail: '적재물 과다 적재 알림 확인',
      time: '2026-07-14 17:20',
    },
  ],
  notifications: [
    {
      id: 1,
      message: '담당 구역 점검 일정이 등록되었습니다.',
      time: '10분 전',
    },
  ],
}

export const ACTION_HISTORY_MOCK_DATA = [
  {
    id: 1,
    time: '2026-07-03 11:19:25',
    location: 'A동 2층 201-2121 복도',
    type: '적치물 감지',
    status: '조치 완료',
    manager: '관리자',
  },
  {
    id: 2,
    time: '2026-07-01 14:20:11',
    location: 'A동 1층 입구',
    type: '소화기 미탐지',
    status: '조치 완료',
    manager: '관리자',
  },
  {
    id: 3,
    time: '2026-06-30 08:45:32',
    location: 'B동 지하 1층 비상구',
    type: '방화문 개방',
    status: '조치 중',
    manager: '홍혁재',
  },
  {
    id: 4,
    time: '2026-06-29 16:37:18',
    location: 'C동 3층 창고',
    type: '연기 감지',
    status: '조치 중',
    manager: '유다현',
  },
  {
    id: 5,
    time: '2026-06-28 09:12:05',
    location: 'A동 5층 전기실',
    type: '과열 감지',
    status: '미조치',
    manager: '-',
  },
]

export const CCTV_INFO_MOCKUP_DATA=[

  {
  id:1,
  section:"A동",
  floor:"1층",
  location:'강당',
  time: '01:00:00',
  videoUrl:"/미정"
  },
  
  {
    id:2,
    section:"A동",
    floor:"2층",
    location:'복도',
    time: '03:00:00',
    videoUrl:"/미정"
  },

  {
    id:3,
    section:"C동",
    floor:"3층",
    location:'복도',
    time: '03:00:00',
    videoUrl:"/미정"
  },

  {
    id:4,
    section:"B동",
    floor:"4층",
    location:'창고',
    time: '04:00:00',
    videoUrl:"/미정"
  },

  {
    id:5,
    section:"C동",
    floor:"5층",
    location:'상가',
    time: '05:00:00',
    videoUrl:"/미정"
  },

  {
    id:6,
    section:"E동",
    floor:"6층",
    location:'사무실',
    time: '06:00:00',
    videoUrl:"/미정"
  },

  {
    id:7,
    section:"F동",
    floor:"6층",
    location:'사무실',
    time: '07:00:00',
    videoUrl:"/미정"
  }
]

export const EVENT_CATEGORY_MOCKUP_DATA=[

{
  id:1,
  location:'1구역',
  type:"소방",
  item : "화재",
  risk :"상",
  severity: 8,
  frequency :1
},
{
  id:2,
  location:'2구역',
  type:"시설",
  item : "미끄러짐",
  risk :"하",
  severity: 1,
  frequency :1
},
{
  id:3,
  location:'3구역',
  type:"안전",
  item : "충돌",
  risk :"하",
  severity: 2,
  frequency :1
},
{
  id:4,
  location:'4구역',
  type:"안전",
  item : "안전모",
  risk :"중",
  severity: 3,
  frequency :1
},

{
  id:5,
  location:'1구역',
  type:"시설",
  item : "적재물",
  risk :"하",
  severity: 1,
  frequency :5
},

{
  id:6,
  location:'2구역',
  type:"시설",
  item : "스프링쿨러",
  risk :"중",
  severity: 2,
  frequency :5
},

{
  id:7,
  location:'3구역',
  type:"시설",
  item : "소화기",
  risk :"중",
  severity: 2,
  frequency :1
},

{
  id:8,
  location:'4구역',
  type:"시설",
  item : "대피로",
  risk :"상",
  severity: 3,
  frequency :2
},

{
  id:9,
  location:'1구역',
  type:"시설",
  item : "충돌",
  risk :"상",
  severity: 3,
  frequency :2
},

{
  id:10,
  location:'4구역',
  type:"안전",
  item : "검사",
  risk :"하",
  severity: 3,
  frequency :2
},
]

export const EDUCATION_INFO_MOCKUP_DATA=[
{
  type : 'new',
  total:120,
  trained : 100,
},
{
  type: 'regular',
  total:200,
  trained : 120,
},
{
  type: 'specialized',
  total:5,
  trained : 5,
},
]