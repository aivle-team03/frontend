import { ACTION_HISTORY_DATA } from "../mocks/ActionHistoryMockData";
import "../styles/ActionHistoryPage.css";
import { useState } from "react";
import RecentEventstable from "../components/dashboard/RecentEventsTable";
import PeriodSelector from "../components/dashboard/PeriodSelector";

function ActionHistoryPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("최근 7일");
  const filteredData = ACTION_HISTORY_DATA.filter((item) => {
    const itemDate = new Date(
      item.time.split(" ")[0].replaceAll(".", "-")
    );

    const today = new Date();

    if (selectedPeriod === "오늘") {
      return itemDate.toDateString() === today.toDateString();
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
      );
    }

    if (selectedPeriod === "지난 달") {
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);

      return (
        itemDate.getMonth() === lastMonth.getMonth() &&
        itemDate.getFullYear() === lastMonth.getFullYear()
      );
    }

    return true;
  });
  const events = filteredData.map((item) => ({
    id: item.id,
    time: item.time,
    location: item.location,
    type: item.type,
    status: item.status,
    manager: item.manager,
  }));

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
  );
}


export default ActionHistoryPage;