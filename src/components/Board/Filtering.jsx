import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { useUiLanguage } from '../../utils/uiLanguage.js'

function Filtering({
  categories,
  selectedCategory,
  startDate,
  endDate,
  keyword,
  onChangeCategory,
  onChangeStartDate,
  onChangeEndDate,
  onChangeKeyword,
  onReset,
}) {
  const { t } = useUiLanguage()
  return (
    <div className="board-filter-row">
      <label className="board-select-filter">
        <span className="sr-only">{t('카테고리')}</span>
        <select value={selectedCategory} onChange={(event) => onChangeCategory(event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>{t(category)}</option>
          ))}
        </select>
      </label>

      <div className="board-date-filter" aria-label={t('신고일 기간')}>
        <input
          aria-label={t('시작일')}
          type="date"
          value={startDate}
          onChange={(event) => onChangeStartDate(event.target.value)}
        />
        <span>~</span>
        <input
          aria-label={t('종료일')}
          type="date"
          value={endDate}
          onChange={(event) => onChangeEndDate(event.target.value)}
        />
      </div>

      <label className="board-search-filter">
        <span className="sr-only">{t('제목, 내용, 장소 검색')}</span>
        <input
          type="search"
          placeholder={t('제목, 내용, 장소 검색')}
          value={keyword}
          onChange={(event) => onChangeKeyword(event.target.value)}
        />
        <SearchRoundedIcon aria-hidden="true" />
      </label>

      <button className="board-reset-button" type="button" onClick={onReset}>{t('초기화')}</button>
    </div>
  )
}

export default Filtering
