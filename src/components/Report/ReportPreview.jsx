function ReportPreview({ title, type, period, author, overview }) {
  const previewOverview = overview?.trim() || '보고서 생성에 필요한 주요 내용을 입력하면 이 영역에 미리보기로 표시됩니다.'

  return (
    <section className="report-preview-card" aria-label="보고서 미리보기">
      <div className="report-card-heading compact">
        <div>
          <span>Preview</span>
          <h2>보고서 미리보기</h2>
        </div>
      </div>

      <article className="report-preview-paper">
        <header className="report-preview-header">
          <span>AI 소방안전관리 비서</span>
          <h1>{title}</h1>
        </header>

        <dl className="report-preview-meta">
          <div>
            <dt>보고서 유형</dt>
            <dd>{type}</dd>
          </div>
          <div>
            <dt>작성 기간</dt>
            <dd>{period}</dd>
          </div>
          <div>
            <dt>작성자</dt>
            <dd>{author || '작성자 미입력'}</dd>
          </div>
        </dl>

        <section className="report-preview-section">
          <h2>1. 보고 개요</h2>
          <p>{previewOverview}</p>
        </section>

        <section className="report-preview-section">
          <h2>2. 주요 확인 사항</h2>
          <ul>
            <li>현장 위험요인 및 관리 상태를 확인합니다.</li>
            <li>조치 필요 항목과 후속 관리 대상을 정리합니다.</li>
            <li>관련 기록은 보고서 생성 시점 기준으로 작성됩니다.</li>
          </ul>
        </section>

        <section className="report-preview-section">
          <h2>3. 종합 의견</h2>
          <p>입력된 기본 정보를 바탕으로 보고서를 생성할 준비가 완료되었습니다.</p>
        </section>
      </article>
    </section>
  )
}

export default ReportPreview
