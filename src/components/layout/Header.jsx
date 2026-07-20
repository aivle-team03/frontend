import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/Header.css'

const extraPageTitles = {
  '/mypage': '마이페이지',
}

const pageHeaderMeta = {
  '/': { icon: HomeOutlinedIcon, description: '오늘의 안전 현황과 조치 상태를 확인하세요.' },
  '/monitoring': { icon: VideocamOutlinedIcon, description: '현장 CCTV와 실시간 감지 상태를 확인하세요.' },
  '/checklists': { icon: ChecklistOutlinedIcon, description: '구역별 안전 점검 항목과 조치 상태를 관리하세요.' },
  '/actions': { icon: HistoryOutlinedIcon, description: '안전 조치 이력과 처리 상태를 확인하세요.' },
  '/law-qa': { icon: GavelOutlinedIcon, description: '산업안전 관련 법규와 관리 기준을 확인하세요.' },
  '/education': { icon: SchoolOutlinedIcon, description: '현장에 필요한 안전 교육 콘텐츠와 이수 현황을 확인하세요.' },
  '/mypage': { icon: AccountCircleOutlinedIcon, description: '관리자 정보와 계정 설정을 관리하세요.' },
}

function Header({ items, setIsLoggedIn }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const headerPath = location.pathname === '/monitoringdetail' ? '/monitoring' : location.pathname
  const currentItem = items.find((item) => item.path === headerPath)
  const title = currentItem?.label ?? extraPageTitles[headerPath] ?? 'BOSS'
  const headerMeta = pageHeaderMeta[headerPath]
  const HeaderIcon = headerMeta?.icon

  const handleMoveToMyPage = () => {
    navigate('/mypage')
    setIsProfileOpen(false)
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token'); // 🚀 1. 토큰 가져오기

      // 🚀 2. Authorization 헤더에 Bearer 토큰을 실어서 백엔드로 요청
      await fetch('http://127.0.0.1:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 핵심: 토큰 전달!
        }
      });

    } catch (error) {
      console.error('로그아웃 통신 중 에러 발생:', error);
    } finally {
      // 🚀 3. 성공하든 에러가 나든 클라이언트의 세션 정보는 확실하게 지우고 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userUid');
      localStorage.removeItem('companyCode');

      setIsProfileOpen(false);
      setIsLoggedIn(false);
    }
  };

  return (
    <header className="app-header">
      <div className="header-title">
        <div className="header-title-row">
          <h1>
            {HeaderIcon && <HeaderIcon className="header-title-icon" />}
            {title}
          </h1>
        </div>
        {headerMeta?.description && <p>{headerMeta.description}</p>}
      </div>

      <div className="header-actions">
        <button className="header-icon-button" type="button" aria-label="알림">
          <NotificationsNoneOutlinedIcon fontSize="small" />
        </button>

        <div className="profile-menu">
          <button
            className="profile-button"
            type="button"
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            onClick={() => setIsProfileOpen((currentValue) => !currentValue)}
          >
            <AccountCircleOutlinedIcon fontSize="small" />
            <span>관리자</span>
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown" role="menu">
              <button className="dropdown-item" type="button" role="menuitem" onClick={handleMoveToMyPage}>
                마이페이지
              </button>
              <button className="dropdown-item" type="button" role="menuitem" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
