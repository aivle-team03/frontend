import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { useUiLanguage } from '../../utils/uiLanguage.js'

function Filtering({ filters, onChange, onReset, isDeleteMode, onToggleDeleteMode }) {
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

      {/* 💡 초기화 버튼과 삭제 버튼을 나란히 배치 */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
        <button className="report-filter-reset" type="button" onClick={onReset}>
          {t('초기화')}
        </button>
        <button
          type="button"
          onClick={onToggleDeleteMode}
          style={{
            height: '42px',
            padding: '0 14px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: isDeleteMode ? '1px solid #ef4444' : '1px solid #e2e8f0',
            backgroundColor: isDeleteMode ? '#fef2f2' : '#ffffff',
            color: isDeleteMode ? '#ef4444' : '#64748b',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!isDeleteMode) {
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.backgroundColor = '#f8fafc'
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleteMode) {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.backgroundColor = '#ffffff'
            }
          }}
        >
          {isDeleteMode ? (
            <>
              <CheckRoundedIcon style={{ fontSize: '18px' }} />
              {t('완료')}
            </>
          ) : (
            <>
              <DeleteOutlineRoundedIcon style={{ fontSize: '18px' }} />
              {t('삭제')}
            </>
          )}
        </button>
      </div>
    </section>
  )
}

export default Filtering