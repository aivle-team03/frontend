import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

function Filtering({
  categories,
  riskOptions,
  selectedCategory,
  selectedRiskLevel,
  startDate,
  endDate,
  keyword,
  onChangeCategory,
  onChangeRiskLevel,
  onChangeStartDate,
  onChangeEndDate,
  onChangeKeyword,
  onReset,
}) {
  return (
    <div className="board-filter-row">
      <label className="board-select-filter">
        <span className="sr-only">카테고리</span>
        <select value={selectedCategory} onChange={(event) => onChangeCategory(event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </label>

      <label className="board-select-filter">
        <span className="sr-only">위험도</span>
        <select value={selectedRiskLevel} onChange={(event) => onChangeRiskLevel(event.target.value)}>
          <option value="전체">위험도 전체</option>
          {riskOptions.map((risk) => (
            <option key={risk.level} value={risk.level}>{risk.label}</option>
          ))}
        </select>
      </label>

      <div className="board-date-filter" aria-label="신고일 기간">
        <input
          aria-label="시작일"
          type="date"
          value={startDate}
          onChange={(event) => onChangeStartDate(event.target.value)}
        />
        <span>~</span>
        <input
          aria-label="종료일"
          type="date"
          value={endDate}
          onChange={(event) => onChangeEndDate(event.target.value)}
        />
      </div>

      <label className="board-search-filter">
        <span className="sr-only">제목, 내용, 장소 검색</span>
        <input
          type="search"
          placeholder="제목, 내용, 장소 검색"
          value={keyword}
          onChange={(event) => onChangeKeyword(event.target.value)}
        />
        <SearchRoundedIcon aria-hidden="true" />
      </label>

      <button className="board-reset-button" type="button" onClick={onReset}>초기화</button>
    </div>
  )
}

export default Filtering
