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