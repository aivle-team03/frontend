import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { BACKEND_API_URL } from '../../config/api.js'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { clearAuthSession } from '../../api/authInterceptor.js'
import { synchronizeStaticUiLanguage, translateUi } from '../../utils/uiLanguage.js'
import '../../styles/Header.css'

const NOTIFICATION_STORAGE_KEY = 'boss-read-notification-ids'
const PREFERENCES_STORAGE_KEY = 'boss-user-preferences'

const EN_PAGE_TITLES = {
  '/': 'Home', '/monitoring': 'CCTV Monitoring', '/checklists': "Today's Tasks",
  '/checklists/management': 'Assignment', '/checklists/inspections': 'Inspection List',
  '/actions': 'Inspection & Action History', '/law-qa': 'AI Assistant', '/education': 'Safety Education',
  '/education-management': 'Education Management', '/risk-management': 'Risk Management',
  '/safety-management': 'Safety Management', '/board': 'Risk Report Board', '/report': 'Reports',
  '/report/create': 'Reports', '/report/list': 'Reports', '/mypage': 'My Page',
}

function getStoredPreferences() {
  try {
    return { language: 'ko', compact: false, notifications: true, ...JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}') }
  } catch {
    return { language: 'ko', compact: false, notifications: true }
  }
}

const extraPageTitles = {
  '/checklists/management': '담당자 배정',
  '/checklists/inspections': '정기 점검 목록',
  '/education-management': '교육 관리',
  '/risk-management': '위험도 관리',
  '/mypage': '마이페이지',
}

const pageHeaderMeta = {
  '/': { icon: HomeOutlinedIcon, description: '오늘의 안전 현황과 조치 상태를 확인하세요.' },
  '/monitoring': { icon: VideocamOutlinedIcon, description: '현장 CCTV와 실시간 감지 상태를 확인하세요.' },
  '/checklists': { icon: ChecklistOutlinedIcon, title: '오늘의 할일', description: '오늘 확인할 안전 점검 항목과 조치 상태를 살펴보세요.' },
  '/checklists/management': { icon: AdminPanelSettingsOutlinedIcon, description: '현장별 체크리스트를 확인하고 담당자를 배정하세요.' },
  '/checklists/inspections': { icon: ChecklistOutlinedIcon, description: '주기적으로 확인해야 할 주요 점검 항목을 한눈에 살펴보세요.' },
  '/actions': { icon: HistoryOutlinedIcon, description: '안전 조치 이력과 처리 상태를 확인하세요.' },
  '/law-qa': { icon: SmartToyOutlinedIcon, description: 'AI 비서에게 점검·조치 및 교육 현황을 물어보세요.' },
  '/education': { icon: SchoolOutlinedIcon, description: '현장에 필요한 안전 교육 콘텐츠와 이수 현황을 확인하세요.' },
  '/education-management': { icon: AdminPanelSettingsOutlinedIcon, description: '대상자별 교육 이수 현황을 관리하고 현장 교육 자료를 생성하세요.' },
  '/risk-management': { icon: QueryStatsRoundedIcon, description: '조치 이력을 바탕으로 현장 위험도를 확인하고 관리하세요.' },
  '/safety-management': { icon: AdminPanelSettingsOutlinedIcon, title: '안전 관리 설정', description: '회사의 안전보건 방침, 위험성 평가 조직, 허용가능 위험도를 관리하세요.' },
  '/board': { icon: CampaignOutlinedIcon, description: '현장에서 접수된 위험 신고와 조치 진행 상태를 확인하세요.' },
  '/report': { icon: ArticleOutlinedIcon, title: '보고서', description: '보고서를 생성하고 생성된 보고서 목록을 확인하세요.' },
  '/report/create': { icon: ArticleOutlinedIcon, title: '보고서', description: '보고서를 생성하고 생성된 보고서 목록을 확인하세요.' },
  '/report/list': { icon: ArticleOutlinedIcon, title: '보고서', description: '보고서를 생성하고 생성된 보고서 목록을 확인하세요.' },
  '/mypage': { icon: AccountCircleOutlinedIcon, description: '관리자 정보와 계정 설정을 관리하세요.' },
}

const notificationIconMap = {
  schedule: EventAvailableRoundedIcon, // 📅 일정/배정
  danger: WarningAmberRoundedIcon,      // ⚠️ 위험 감지
  complete: TaskAltRoundedIcon,        //  조치/점검/보고서/영상 완료
  board: CampaignOutlinedIcon,          // 📢 게시판 제보
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
  const [user, setUser] = useState({})
  const [notifications, setNotifications] = useState([])
  const [preferences, setPreferences] = useState(getStoredPreferences)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('language')

  const [activeMenu, setActiveMenu] = useState(null)
  const [readNotificationIds, setReadNotificationIds] = useState(getStoredReadIds)
  const menuRootRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const headerPath = location.pathname === '/monitoringdetail' ? '/monitoring' : location.pathname
  const currentItem = [...items, ...items.flatMap((item) => item.children ?? [])].find((item) => item.path === headerPath)
  const headerMeta = pageHeaderMeta[headerPath]
  const koreanTitle = headerMeta?.title ?? currentItem?.label ?? extraPageTitles[headerPath] ?? 'BOSS'
  const title = preferences.language === 'en' ? (EN_PAGE_TITLES[headerPath] ?? koreanTitle) : koreanTitle
  const HeaderIcon = headerMeta?.icon

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.get(`${BACKEND_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const userData = response.data
        if (userData) {
          setUser({
            name: userData.name || userData.user_id || '관리자',
            role: userData.role || '소방안전 관리자',
            department: userData.department || '시설관리팀',
            email: userData.email || '',
          })
        }
      } catch (error) {
        console.error('헤더 사용자 프로필 로드 실패:', error)
      }
    }

    fetchUserProfile()
  }, [])

  useEffect(() => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
    document.documentElement.lang = preferences.language
    document.body.classList.remove('boss-compact-mode')
    window.dispatchEvent(new CustomEvent('boss-language-change', { detail: preferences.language }))
  }, [preferences])

  useEffect(() => synchronizeStaticUiLanguage(preferences.language), [preferences.language])


  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get(`${BACKEND_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(response.data || [])
    } catch (error) {
      console.error('알림 목록 조회 실패:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      try {
        await axios.post(`${BACKEND_API_URL}/api/auth/logout`)
      } catch (error) {
        console.warn('로그아웃 토큰 무효화 요청 실패:', error)
      }

      clearAuthSession()
      setActiveMenu(null);
      window.location.href = '/login';
    }
  }

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length
  }, [notifications])

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

  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('token')
      if (!notification.read) {
        // 백엔드 단일 읽음 처리 API 호출
        await axios.patch(
          `${BACKEND_API_URL}/api/notifications/${notification.id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        // 로컬 State 즉시 반영
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )
      }
    } catch (error) {
      console.error('단일 알림 읽음 처리 실패:', error)
    }

    setActiveMenu(null)
    if (notification.path) {
      navigate(notification.path)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${BACKEND_API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error('전체 알림 읽음 처리 실패:', error)
    }
  }

  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation() // 항목 클릭(페이지 이동) 방지
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${BACKEND_API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error('알림 삭제 실패:', error)
    }
  }

  const handleClearAllNotifications = async () => {
    if (!notifications.length) return
    if (!window.confirm('모든 알림을 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${BACKEND_API_URL}/api/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications([])
    } catch (error) {
      console.error('전체 알림 삭제 실패:', error)
    }
  }

  const handleMoveToMyPage = () => {
    setActiveMenu(null)
    navigate('/mypage')
  }

  const handleMoveToSafetyManagement = () => {
    setActiveMenu(null)
    navigate('/safety-management')
  }

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  return (
    <header className="app-header">
      <div className="header-title">
        <div className="header-title-row">
          <h1>
            {HeaderIcon && <HeaderIcon className="header-title-icon" />}
            {title}
          </h1>
        </div>
        {headerMeta?.description && <p>{translateUi(headerMeta.description, preferences.language)}</p>}
      </div>

      <div className="header-actions" ref={menuRootRef}>
        <div className="notification-menu">
          <button
            className={`header-icon-button${activeMenu === 'notifications' ? ' is-active' : ''}`}
            type="button"
            aria-label={`알림${unreadCount ? `, 미확인 ${unreadCount}개` : ''}`}
            aria-expanded={activeMenu === 'notifications'}
            aria-haspopup="menu"
            onClick={() => setActiveMenu((current) => (current === 'notifications' ? null : 'notifications'))}
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
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button type="button" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                    <DoneAllRoundedIcon fontSize="small" />모두 읽음
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllNotifications}
                    disabled={notifications.length === 0}
                    style={{
                      color: notifications.length === 0 ? undefined : '#ef4444',
                      cursor: notifications.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <DeleteSweepOutlinedIcon fontSize="small" />모두 삭제
                  </button>
                </div>
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    알림이 없습니다.
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const NotificationIcon = notificationIconMap[notification.category] ?? NotificationsNoneOutlinedIcon
                    return (
                      <div
                        className={`notification-item notification-${notification.category}${notification.read ? ' is-read' : ''}`}
                        role="menuitem"
                        tabIndex={0}
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleNotificationClick(notification)
                          }
                        }}
                        style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <span className="notification-type-icon">
                          <NotificationIcon />
                        </span>
                        <span className="notification-copy">
                          <span className="notification-title-row">
                            <strong>{notification.title}</strong>
                            {!notification.read && <i aria-label="미확인" />}
                          </span>
                          <span>{notification.message}</span>
                          <small>{notification.time}</small>
                        </span>
                        <button
                          type="button"
                          className="notification-delete-btn"
                          title="삭제"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 'auto'
                          }}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-menu">
          <button
            className={`profile-button${activeMenu === 'profile' ? ' is-active' : ''}`}
            type="button"
            aria-expanded={activeMenu === 'profile'}
            aria-haspopup="menu"
            onClick={() => setActiveMenu((current) => (current === 'profile' ? null : 'profile'))}
          >
            <span className="profile-avatar" aria-hidden="true">
              <AccountCircleRoundedIcon />
            </span>
            <span className="profile-button-copy">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
            <KeyboardArrowDownRoundedIcon className="profile-chevron" />
          </button>

          {activeMenu === 'profile' && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-overview">
                <span className="profile-avatar profile-avatar-large" aria-hidden="true">
                  <AccountCircleRoundedIcon />
                </span>
                <button
                  className="profile-account-summary"
                  type="button"
                  role="menuitem"
                  onClick={handleMoveToSafetyManagement}
                >
                  <strong>{user.name}</strong>
                  <span>
                    {user.department} · {user.role}
                  </span>
                  <small>{user.email}</small>
                </button>
                <button
                  className="profile-logout-button"
                  type="button"
                  role="menuitem"
                  aria-label={translateUi('로그아웃', preferences.language)}
                  onClick={handleLogout}
                >
                  <LogoutOutlinedIcon />
                  <span>{translateUi('로그아웃', preferences.language)}</span>
                </button>
              </div>
              <button className="profile-dropdown-link" type="button" role="menuitem" onClick={handleMoveToMyPage}>
                <ManageAccountsOutlinedIcon />
                <span>
                  <strong>마이페이지</strong>
                </span>
                <ArrowForwardIosRoundedIcon />
              </button>
              <button className="profile-dropdown-link profile-settings-link" type="button" role="menuitem" onClick={() => { setActiveMenu(null); setSettingsTab('language'); setIsSettingsOpen(true) }}>
                <SettingsOutlinedIcon />
                <span>
                  <strong>{preferences.language === 'en' ? 'Settings' : '설정'}</strong>
                  <small>{preferences.language === 'en' ? 'Language settings' : '언어 설정'}</small>
                </span>
                <ArrowForwardIosRoundedIcon />
              </button>
            </div>
          )}
        </div>
      </div>
      {isSettingsOpen && <SettingsModal
        preferences={preferences}
        onChange={updatePreference}
        activeTab={settingsTab}
        onTabChange={setSettingsTab}
        onClose={() => setIsSettingsOpen(false)}
      />}
    </header>
  )
}

function SettingsModal({ preferences, onChange, onClose }) {
  const isEnglish = preferences.language === 'en'
  const copy = isEnglish
    ? { title: 'Settings', description: 'Choose the language used for BOSS interface labels.', language: 'Display language', help: 'Static interface labels change immediately. Data entered by users remains unchanged.', close: 'Close' }
    : { title: '설정', description: 'BOSS 화면에 표시할 언어를 선택하세요.', language: '표시 언어', help: '고정된 화면 문구는 즉시 변경되며, 사용자가 입력한 데이터는 원문을 유지합니다.', close: '닫기' }

  return <div className="settings-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title" onMouseDown={(event) => event.stopPropagation()}>
      <header>
        <div><span>PERSONAL PREFERENCES</span><h2 id="settings-modal-title">{copy.title}</h2><p>{copy.description}</p></div>
        <button type="button" aria-label={copy.close} onClick={onClose}><CloseRoundedIcon /></button>
      </header>
      <div className="settings-modal-body settings-modal-body-language">
        <div className="settings-panel">
          <section>
            <div className="settings-label"><strong><TranslateRoundedIcon /> {copy.language}</strong><span>{copy.help}</span></div>
            <div className="settings-choice-grid">
              <button className={preferences.language === 'ko' ? 'is-selected' : ''} type="button" onClick={() => onChange('language', 'ko')}>한국어</button>
              <button className={preferences.language === 'en' ? 'is-selected' : ''} type="button" onClick={() => onChange('language', 'en')}>English</button>
            </div>
          </section>
        </div>
      </div>
      <footer><button type="button" onClick={onClose}>{copy.close}</button></footer>
    </section>
  </div>
}

export default Header
