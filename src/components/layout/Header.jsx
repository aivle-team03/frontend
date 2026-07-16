import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/Header.css'

const extraPageTitles = {
  '/mypage': '마이페이지',
}

function Header({ items, setIsLoggedIn }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const currentItem = items.find((item) => item.path === location.pathname)
  const title = currentItem?.label ?? extraPageTitles[location.pathname] ?? 'BOSS'
  const isHome = location.pathname === '/'

  const handleMoveToMyPage = () => {
    navigate('/mypage')
    setIsProfileOpen(false)
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('token'); // 저장된 토큰 가져오기

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ⚠️ 이 부분이 누락되었거나 오타가 있으면 401 에러가 납니다!
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        // 로컬 스토리지 비우고 로그인 페이지로 이동 등
        localStorage.clear();
        setIsLoggedIn(false);
      } else if (response.status === 401) {
        console.error("인증 실패: 토큰이 없거나 만료되었습니다.");
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-title">
        <h1>{title}</h1>
        {isHome && <p>오늘의 안전 현황과 조치 상태를 확인하세요.</p>}
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
  );
}

export default Header
