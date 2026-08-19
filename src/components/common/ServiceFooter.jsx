import { Link } from 'react-router-dom'
import '../../styles/service-footer.css'
import { useUiLanguage } from '../../utils/uiLanguage.js'

function ServiceFooter() {
  const { t } = useUiLanguage()
  return (
    <footer className="service-footer">
      <div className="service-footer-links">
        <Link to="/privacy-policy">{t('개인정보 처리방침')}</Link>
        <i aria-hidden="true">|</i>
        <Link to="/terms">{t('이용약관')}</Link>
      </div>
      <span>© 2026 BOSS Safety Management</span>
    </footer>
  )
}
export default ServiceFooter
