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
