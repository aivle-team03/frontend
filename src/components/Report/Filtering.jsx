import { useUiLanguage } from '../../utils/uiLanguage.js'

function Filtering({ filters, onChange, onReset }) {
  const { t } = useUiLanguage()
  return (
    <section className="report-filter-panel" aria-label={t('보고서 필터')}>
      <label className="report-filter-field report-filter-search">
        <span>{t('제목 검색')}</span>
        <input
          type="search"
          value={filters.keyword}
          placeholder={t('보고서 제목 검색')}
          onChange={(event) => onChange('keyword', event.target.value)}
        />
      </label>

      <div className="report-filter-field">
        <span>{t('기간')}</span>
        <div className="report-filter-range">
          <input
            aria-label={t('시작일')}
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
          />
          <b>~</b>
          <input
            aria-label={t('종료일')}
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange('endDate', event.target.value)}
          />
        </div>
      </div>

      <label className="report-filter-field">
        <span>{t('생성자')}</span>
        <input
          type="text"
          value={filters.author}
          placeholder={t('생성자 검색')}
          onChange={(event) => onChange('author', event.target.value)}
        />
      </label>

      <button className="report-filter-reset" type="button" onClick={onReset}>
        {t('초기화')}
      </button>
    </section>
  )
}

export default Filtering
