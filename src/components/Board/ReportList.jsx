import { useUiLanguage } from '../../utils/uiLanguage.js'

function ReportList({
  reports,
  selectedReportIds,
  onOpenReport,
  onToggleReport,
  onToggleAllReports,
}) {
  const { t } = useUiLanguage()
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
            <th>
              <input
                type="checkbox"
                checked={reports.some((report) => report.statusKey === 'registered') && reports.filter((report) => report.statusKey === 'registered').every((report) => selectedReportIds.includes(report.id))}
                onChange={(event) => onToggleAllReports(event.target.checked)}
                aria-label="접수할 게시글 전체 선택"
              />
            </th>
            <th>{t('번호')}</th>
            <th>{t('카테고리')}</th>
            <th>{t('제목')}</th>
            <th className="board-center-column">{t('위험도')}</th>
            <th>{t('장소')}</th>
            <th>{t('신고자')}</th>
            <th>{t('신고일')}</th>
            <th className="board-center-column">{t('상태')}</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => {
            return (
              <tr
                className="board-clickable-row"
                key={report.id}
                role="button"
                tabIndex="0"
                onClick={() => onOpenReport(report.id)}
                onKeyDown={(event) => handleReportRowKeyDown(event, report.id)}
              >
                <td onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedReportIds.includes(report.id)}
                    disabled={report.statusKey !== 'registered'}
                    onChange={() => onToggleReport(report.id)}
                    aria-label={`${report.title} 접수 선택`}
                  />
                </td>
                <td>{reports.length - index}</td>
                <td>{t(report.category)}</td>
                <td className="board-title-cell">
                  <strong>{report.title}</strong>
                  <span>{report.description}</span>
                </td>
                <td className="board-center-column">
                  <span className={`board-risk-badge risk-${report.riskLevel}`}>{t(report.riskLabel)}</span>
                </td>
                <td>{report.location}</td>
                <td>{t(report.reporter)}</td>
                <td>{report.reportedAt}</td>
                <td className="board-center-column">
                  <span className={`board-status-badge status-${report.statusKey}`}>{t(report.status)}</span>
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
