function ReportDetail({ report, onClose }) {
  return (
    <div className="board-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="board-report-modal board-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-detail-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="board-modal-header">
          <div>
            <span>신고 상세</span>
            <h2 id="board-detail-modal-title">{report.title}</h2>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose}>×</button>
        </div>

        <div className="board-detail-body">
          <div className="board-detail-badge-row">
            <span className={`board-status-badge status-${report.statusKey}`}>{report.status}</span>
          </div>

          <dl className="board-detail-grid">
            <div>
              <dt>번호</dt>
              <dd>{report.id}</dd>
            </div>
            <div>
              <dt>카테고리</dt>
              <dd>{report.category}</dd>
            </div>
            <div>
              <dt>장소</dt>
              <dd>{report.location}</dd>
            </div>
            <div>
              <dt>신고자</dt>
              <dd>{report.reporter}</dd>
            </div>
            <div>
              <dt>신고일</dt>
              <dd>{report.reportedAt}</dd>
            </div>
            <div>
              <dt>위험도</dt>
              <dd>
                <span className={`board-risk-badge risk-${report.riskLevel}`}>
                  {report.riskLabel}
                </span>
              </dd>
            </div>
          </dl>

          <section className="board-detail-description" aria-label="신고 내용">
            <h3>내용</h3>
            <p>{report.description}</p>
          </section>

          {report.photoUrl && (
            <section className="board-detail-photo" aria-label="신고 사진">
              <h3>사진</h3>
              <img src={report.photoUrl} alt={report.photoName || `${report.title} 신고 사진`} />
              {report.photoName && <span>{report.photoName}</span>}
            </section>
          )}
        </div>
      </section>
    </div>
  )
}

export default ReportDetail
