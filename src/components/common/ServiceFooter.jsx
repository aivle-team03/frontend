import { Link } from 'react-router-dom'
import '../../styles/service-footer.css'

function ServiceFooter() {
  return (
    <footer className="service-footer">
      <div className="service-footer-links">
        <Link to="/privacy-policy">개인정보 처리방침</Link>
        <i aria-hidden="true">|</i>
        <Link to="/terms">이용약관</Link>
      </div>
      <span>© 2026 BOSS Safety Management</span>
    </footer>
  )
}
export default ServiceFooter
