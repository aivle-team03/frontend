import { useState } from 'react'
import PeriodSelector from '../components/dashboard/PeriodSelector.jsx'
import RecentEventsTable from '../components/dashboard/RecentEventsTable.jsx'
import { ACTION_HISTORY_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/ActionHistoryPage.css'

function ActionHistoryPage() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('전체')
  const [customPeriod, setCustomPeriod] = useState(null)
  const filteredData = ACTION_HISTORY_MOCK_DATA.filter((item) => {
    const itemDate = new Date(item.time.replace(' ', 'T'))
    const today = new Date()

    if (selectedPeriod === '이번 달') {
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      )
    }

    if (selectedPeriod === '지난 달') {
      const lastMonth = new Date()
      lastMonth.setMonth(today.getMonth() - 1)

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
    id: item.id,
    time: item.time,
    location: item.location,
    type: item.type,
    status: item.status,
    manager: item.manager,
  }))

  return (
    <div className="action-history-layout">
      <div className="history-content">
        <RecentEventsTable
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
        onApplyCustomPeriod={setCustomPeriod}
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
