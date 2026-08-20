import { Link, useLocation } from 'react-router-dom'
import '../../styles/service-footer.css'
import { useUiLanguage } from '../../utils/uiLanguage.js'

const POLICY_PATHS = ['/privacy-policy', '/terms']

function ServiceFooter() {
  const { t } = useUiLanguage()
  const { pathname } = useLocation()

  // 정책 문서끼리는 형제 관계라 히스토리에 쌓지 않는다. 쌓으면 두 문서를 오간 만큼
  // '뒤로 가기'를 눌러야 원래 보던 화면으로 나갈 수 있다.
  const replaceHistory = POLICY_PATHS.includes(pathname)

  return (
    <footer className="service-footer">
      <div className="service-footer-links">
        <Link to="/privacy-policy" replace={replaceHistory}>{t('개인정보 처리방침')}</Link>
        <i aria-hidden="true">|</i>
        <Link to="/terms" replace={replaceHistory}>{t('이용약관')}</Link>
      </div>
      <span>© 2026 BOSS Safety Management</span>
    </footer>
  )
}
export default ServiceFooter
