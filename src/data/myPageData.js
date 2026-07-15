export const userData = {
  userId: "user001",
  name: "김에이블러",
  department: "안전관리팀",
  role: "관리자",
  profileImage: "/images/profile.png",
  email: "kim@aivle.com",
  area: "12 구역"
};

export const workLogs = [
  {
    id: 1,
    userId: "user001",
    userName: "김에이블러",
    action: "위험요소 조치 완료",
    detail: "방화문 개방 상태 조치 완료",
    time: "2026-07-15 09:45",
  },
  {
    id: 2,
    userId: "user002",
    userName: "이안전",
    action: "소화기 점검",
    detail: "3층 창고 소화기 점검 완료",
    time: "2026-07-15 08:30",
  },
  {
    id: 3,
    userId: "user001",
    userName: "김에이블러",
    action: "AI 위험 알림 확인",
    detail: "적재물 과다 적재 알림 확인",
    time: "2026-07-14 17:20",
  },
];

export const notifications = [
  {
    id: 1,
    message: "담당 구역 점검 일정이 등록되었습니다.",
    time: "10분 전",
  },
];

export default {
  ...userData,
  ...workLogs,
  ...notifications,
};