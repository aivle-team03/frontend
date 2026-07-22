import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MY_PAGE_MOCK_DATA } from '../../mocks/mockData.js'
import '../../styles/Header.css'

const NOTIFICATION_STORAGE_KEY = 'boss-read-notification-ids'

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

const notificationIconMap = {
  schedule: EventAvailableRoundedIcon,
  danger: WarningAmberRoundedIcon,
  complete: TaskAltRoundedIcon,
}

function getStoredReadIds() {
  try {
    const storedValue = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    const parsedValue = storedValue ? JSON.parse(storedValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function Header({ items }) {
  const [activeMenu, setActiveMenu] = useState(null)
  const [readNotificationIds, setReadNotificationIds] = useState(getStoredReadIds)
  const menuRootRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, notifications } = MY_PAGE_MOCK_DATA
  const headerPath = location.pathname === '/monitoringdetail' ? '/monitoring' : location.pathname
  const currentItem = items.find((item) => item.path === headerPath)
  const title = currentItem?.label ?? extraPageTitles[headerPath] ?? 'BOSS'
  const headerMeta = pageHeaderMeta[headerPath]
  const HeaderIcon = headerMeta?.icon

  const notificationItems = useMemo(
    () => notifications.map((notification) => ({
      ...notification,
      read: notification.read || readNotificationIds.includes(notification.id),
    })),
    [notifications, readNotificationIds],
  )
  const unreadCount = notificationItems.filter((notification) => !notification.read).length

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(readNotificationIds))
    } catch {
      // 저장소를 사용할 수 없는 환경에서도 알림 확인은 현재 세션에서 동작합니다.
    }
  }, [readNotificationIds])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRootRef.current && !menuRootRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setActiveMenu(null)
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const markNotificationAsRead = (notificationId) => {
    setReadNotificationIds((currentIds) => (
      currentIds.includes(notificationId) ? currentIds : [...currentIds, notificationId]
    ))
  }

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id)
    setActiveMenu(null)
    if (notification.path) navigate(notification.path)
  }

  const handleMarkAllAsRead = () => {
    setReadNotificationIds(notifications.map((notification) => notification.id))
  }

  const handleMoveToMyPage = () => {
    setActiveMenu(null)
    navigate('/mypage')
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      await fetch('http://127.0.0.1:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

    } catch (error) {
      console.error('로그아웃 통신 중 에러 발생:', error);
    } finally {
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

      <div className="header-actions" ref={menuRootRef}>
        <div className="notification-menu">
          <button
            className={`header-icon-button${activeMenu === 'notifications' ? ' is-active' : ''}`}
            type="button"
            aria-label={`알림${unreadCount ? `, 미확인 ${unreadCount}개` : ''}`}
            aria-expanded={activeMenu === 'notifications'}
            aria-haspopup="menu"
            onClick={() => setActiveMenu((current) => current === 'notifications' ? null : 'notifications')}
          >
            <NotificationsNoneOutlinedIcon />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {activeMenu === 'notifications' && (
            <div className="notification-dropdown" role="menu" aria-label="알림 목록">
              <div className="notification-dropdown-header">
                <div>
                  <strong>알림</strong>
                  <span>미확인 알림 {unreadCount}개</span>
                </div>
                <button type="button" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                  <DoneAllRoundedIcon />모두 읽음
                </button>
              </div>

              <div className="notification-list">
                {notificationItems.map((notification) => {
                  const NotificationIcon = notificationIconMap[notification.category] ?? NotificationsNoneOutlinedIcon
                  return (
                    <button
                      className={`notification-item notification-${notification.category}${notification.read ? ' is-read' : ''}`}
                      type="button"
                      role="menuitem"
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="notification-type-icon"><NotificationIcon /></span>
                      <span className="notification-copy">
                        <span className="notification-title-row">
                          <strong>{notification.title}</strong>
                          {!notification.read && <i aria-label="미확인" />}
                        </span>
                        <span>{notification.message}</span>
                        <small>{notification.time}</small>
                      </span>
                    </button>
                  )
                })}
              </div>

              <button className="notification-settings-link" type="button" onClick={handleMoveToMyPage}>
                알림 설정 관리
                <ArrowForwardIosRoundedIcon />
              </button>
            </div>
          )}
        </div>

        <div className="profile-menu">
          <button
            className={`profile-button${activeMenu === 'profile' ? ' is-active' : ''}`}
            type="button"
            aria-expanded={activeMenu === 'profile'}
            aria-haspopup="menu"
            onClick={() => setActiveMenu((current) => current === 'profile' ? null : 'profile')}
          >
            <span className="profile-avatar" aria-hidden="true"><AccountCircleRoundedIcon /></span>
            <span className="profile-button-copy">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
            <KeyboardArrowDownRoundedIcon className="profile-chevron" />
          </button>

          {activeMenu === 'profile' && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-overview">
                <span className="profile-avatar profile-avatar-large" aria-hidden="true"><AccountCircleRoundedIcon /></span>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.department} · {user.role}</span>
                  <small>{user.email}</small>
                </div>
                {/* TODO(auth): Connect this control to the logout endpoint/session cleanup flow. */}
                <button className="profile-logout-button" type="button" role="menuitem" aria-label="로그아웃">
                  <LogoutOutlinedIcon />
                  <span>로그아웃</span>
                </button>
              </div>
              <button className="profile-dropdown-link" type="button" role="menuitem" onClick={handleMoveToMyPage}>
                <ManageAccountsOutlinedIcon />
                <span>
                  <strong>마이페이지</strong>
                  <small>프로필과 알림 설정 관리</small>
                </span>
                <ArrowForwardIosRoundedIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
