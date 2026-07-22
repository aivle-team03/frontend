function ReportList({ reports, statusOptions, canEditStatus, onOpenReport, onUpdateStatus }) {
  const handleReportRowKeyDown = (event, reportId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenReport(reportId)
    }
  }

  return (
    <div className="board-table-shell">
      <table className="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>위험도</th>
            <th>장소</th>
            <th>신고자</th>
            <th>신고일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              className="board-clickable-row"
              key={report.id}
              role="button"
              tabIndex="0"
              onClick={() => onOpenReport(report.id)}
              onKeyDown={(event) => handleReportRowKeyDown(event, report.id)}
            >
              <td>{report.id}</td>
              <td>{report.category}</td>
              <td className="board-title-cell">
                <strong>{report.title}</strong>
                <span>{report.description}</span>
              </td>
              <td>
                <span className={`board-risk-badge risk-${report.riskLevel}`}>{report.riskLabel}</span>
              </td>
              <td>{report.location}</td>
              <td>{report.reporter}</td>
              <td>{report.reportedAt}</td>
              <td>
                <label
                  className={`board-status-select status-${report.statusKey}`}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <span className="sr-only">{report.title} 상태 변경</span>
                  <select
                    value={report.statusKey}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => onUpdateStatus(report.id, event.target.value)}
                    disabled={!canEditStatus}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.key} value={status.key}>{status.label}</option>
                    ))}
                  </select>
                </label>
              </td>
            </tr>
          ))}
          {!reports.length && (
            <tr>
              <td className="board-empty-cell" colSpan="8">검색 조건에 맞는 신고가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ReportList
