function ReportList({
  reports,
  selectedReportIds,
  onToggleReport,
  onToggleVisibleReports,
  onOpenReport,
}) {
  const receivableReports = reports.filter((report) => report.statusKey === 'registered')
  const receivableIds = receivableReports.map((report) => report.id)
  const isAllVisibleSelected = receivableIds.length > 0 && receivableIds.every((id) => selectedReportIds.includes(id))

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
            <th className="board-select-col">
              <input
                type="checkbox"
                checked={isAllVisibleSelected}
                disabled={receivableIds.length === 0}
                onChange={(event) => onToggleVisibleReports(event.target.checked, receivableIds)}
                aria-label="등록 상태 신고 전체 선택"
              />
            </th>
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
          {reports.map((report) => {
            const isReceivable = report.statusKey === 'registered'

            return (
              <tr
                className="board-clickable-row"
                key={report.id}
                role="button"
                tabIndex="0"
                onClick={() => onOpenReport(report.id)}
                onKeyDown={(event) => handleReportRowKeyDown(event, report.id)}
              >
                <td className="board-select-col" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedReportIds.includes(report.id)}
                    disabled={!isReceivable}
                    onChange={() => onToggleReport(report.id)}
                    aria-label={`${report.title} 선택`}
                  />
                </td>
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
                  <span className={`board-status-badge status-${report.statusKey}`}>{report.status}</span>
                </td>
              </tr>
            )
          })}
          {!reports.length && (
            <tr>
              <td className="board-empty-cell" colSpan="9">검색 조건에 맞는 신고가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ReportList
