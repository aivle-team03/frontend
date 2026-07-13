function RecentEvents({ events }) {
  return (
    <section className="dashboard-card recent-events">
      <h2>최근 이상 발생 리스트</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>시간</th>
              <th>위치</th>
              <th>유형</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={`${event.time}-${event.location}-${event.status}`}>
                <td>{event.time}</td>
                <td>{event.location}</td>
                <td>{event.type}</td>
                <td>
                  <span
                    className={
                      event.status === '조치 완료'
                        ? 'status-badge is-complete'
                        : 'status-badge is-pending'
                    }
                  >
                    {event.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecentEvents
