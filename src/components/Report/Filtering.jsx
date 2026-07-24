function Filtering({ filters, onChange, onReset }) {
  return (
    <section className="report-filter-panel" aria-label="보고서 필터">
      <div className="report-filter-field">
        <span>기간</span>
        <div className="report-filter-range">
          <input
            aria-label="시작일"
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
          />
          <b>~</b>
          <input
            aria-label="종료일"
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange('endDate', event.target.value)}
          />
        </div>
      </div>

      <label className="report-filter-field">
        <span>작성자</span>
        <input
          type="text"
          value={filters.author}
          placeholder="작성자 검색"
          onChange={(event) => onChange('author', event.target.value)}
        />
      </label>

      <label className="report-filter-field report-filter-search">
        <span>제목 검색</span>
        <input
          type="search"
          value={filters.keyword}
          placeholder="보고서 제목 검색"
          onChange={(event) => onChange('keyword', event.target.value)}
        />
      </label>

      <button className="report-filter-reset" type="button" onClick={onReset}>
        초기화
      </button>
    </section>
  )
}

export default Filtering
