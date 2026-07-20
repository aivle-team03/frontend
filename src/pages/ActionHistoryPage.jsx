import "../styles/ActionHistoryPage.css";
import { useState, useEffect } from "react";
import RecentEventstable from "../components/dashboard/RecentEventsTable";
import PeriodSelector from "../components/dashboard/PeriodSelector";
import axios from "axios";

function ActionHistoryPage() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("최근 7일");

  useEffect(() => {
    fetchActionHistory();
  }, []);

  const fetchActionHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // 🔒 JWT 로그인 토큰 꺼내기

      const response = await axios.get("http://127.0.0.1:8000/api/checklists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChecklists(response.data);
    } catch (error) {
      console.error("조치이력 로드 실패:", error);
      alert("조치 이력 데이터를 불러오지 못했습니다. 로그인 상태를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = checklists.filter((item) => {
    if (!item.date) return false;

    // DB의 'YYYY-MM-DD' 날짜 포맷 파싱
    const itemDate = new Date(item.date);
    const today = new Date();

    // 시간 정보 제거하고 순수 날짜 비교를 위해 초기화
    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);

    if (selectedPeriod === "오늘") {
      return itemDate.getTime() === today.getTime();
    }

    if (selectedPeriod === "최근 7일") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }

    if (selectedPeriod === "이번 달") {
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      )
    }

    if (selectedPeriod === "지난 달") {
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);
      return (
        itemDate.getMonth() === lastMonth.getMonth() &&
        itemDate.getFullYear() === lastMonth.getFullYear()
      )
    }

    if (selectedPeriod === '직접 설정' && customPeriod) {
      const startDate = new Date(`${customPeriod.startDate}T00:00:00`)
      const endDate = new Date(`${customPeriod.endDate}T23:59:59.999`)

      return itemDate >= startDate && itemDate <= endDate
    }

    return true
  })
  const events = filteredData.map((item) => ({
    id: item.checklist_id,
    time: item.date,
    location: item.camera_id ? `CCTV #${item.camera_id} 구역` : "지정 안 됨",
    type: item.content || "정기 조치 점검",
    status: item.status,
    manager: item.uid ? `${item.uid}` : "미지정",
  }));

  if (loading) return <div className="loading-container">조치 이력을 가져오는 중...</div>;

  return (
    <div className="action-history-layout">
      <div className="history-content">
        <RecentEventstable
          events={events}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </div>

      <aside className="report-panel">
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          options={['전체', '이번 달', '지난 달', '직접 설정']}
        />
        <div className="report-summary">
          <span>조회 결과</span>
          <strong>{events.length}건</strong>
          <p>
            선택기간: {selectedPeriod}
          </p>
        </div>
        <button className="generate-btn">리포트 생성</button>
        <button className="download-btn">다운로드</button>
      </aside>
    </div>
  )
}

export default ActionHistoryPage
