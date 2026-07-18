import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useEffect, useState } from 'react'
import { MY_PAGE_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/MyPage.css'

const NOTIFICATION_SETTINGS_STORAGE_KEY = 'boss-notification-settings'
const defaultNotificationSettings = {
  risk: true,
  schedule: true,
  completion: false,
}

function getStoredNotificationSettings() {
  try {
    const storedValue = window.localStorage.getItem(NOTIFICATION_SETTINGS_STORAGE_KEY)
    const parsedValue = storedValue ? JSON.parse(storedValue) : {}
    return { ...defaultNotificationSettings, ...parsedValue }
  } catch {
    return defaultNotificationSettings
  }
}

function MyPage() {
  const { user, workLogs, notifications } = MY_PAGE_MOCK_DATA
  const [notificationSettings, setNotificationSettings] = useState(getStoredNotificationSettings)
  const myLogs = workLogs.filter((log) => log.userId === user.userId)
  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    try {
      window.localStorage.setItem(
        NOTIFICATION_SETTINGS_STORAGE_KEY,
        JSON.stringify(notificationSettings),
      )
    } catch {
      // 저장소를 사용할 수 없는 환경에서도 현재 화면에서는 설정이 유지됩니다.
    }
  }, [notificationSettings])

  const toggleNotificationSetting = (setting) => {
    setNotificationSettings((currentSettings) => ({
      ...currentSettings,
      [setting]: !currentSettings[setting],
    }))
  }

  return (
    <section className="my-page-container" aria-label="마이페이지">
      <article className="my-profile-hero">
        <div className="my-profile-main">
          <span className="my-profile-avatar" aria-hidden="true"><AccountCircleRoundedIcon /></span>
          <div className="my-profile-copy">
            <span className="my-role-badge"><ShieldOutlinedIcon />{user.role}</span>
            <h2>{user.name}</h2>
            <p>{user.department}</p>
            <span className="my-email"><EmailOutlinedIcon />{user.email}</span>
          </div>
        </div>
        <div className="my-profile-stats">
          <div>
            <LocationOnOutlinedIcon />
            <span>담당 구역</span>
            <strong>{user.area}</strong>
          </div>
          <div>
            <NotificationsActiveOutlinedIcon />
            <span>새 알림</span>
            <strong>{unreadNotificationCount}건</strong>
          </div>
        </div>
      </article>

      <div className="my-page-content-grid">
        <article className="my-page-card notification-settings-card">
          <div className="my-card-heading">
            <span className="my-card-icon"><NotificationsActiveOutlinedIcon /></span>
            <div>
              <h3>알림 설정</h3>
              <p>필요한 안전 알림만 선택해서 받을 수 있습니다.</p>
            </div>
          </div>

          <div className="notification-setting-list">
            <label>
              <span><strong>AI 위험 감지</strong><small>담당 구역에서 위험 요소가 감지되면 알립니다.</small></span>
              <input type="checkbox" checked={notificationSettings.risk} onChange={() => toggleNotificationSetting('risk')} />
              <i aria-hidden="true" />
            </label>
            <label>
              <span><strong>점검 일정</strong><small>예정된 안전 점검 일정을 미리 알립니다.</small></span>
              <input type="checkbox" checked={notificationSettings.schedule} onChange={() => toggleNotificationSetting('schedule')} />
              <i aria-hidden="true" />
            </label>
            <label>
              <span><strong>조치 완료</strong><small>담당 위험 항목의 조치 완료 결과를 알립니다.</small></span>
              <input type="checkbox" checked={notificationSettings.completion} onChange={() => toggleNotificationSetting('completion')} />
              <i aria-hidden="true" />
            </label>
          </div>
        </article>

        <article className="my-page-card recent-work-logs">
          <div className="my-card-heading">
            <span className="my-card-icon"><HistoryRoundedIcon /></span>
            <div>
              <h3>최근 작업 로그</h3>
              <p>최근 계정 활동과 안전 조치 내역입니다.</p>
            </div>
          </div>

          <div className="work-log-list">
            {myLogs.map((log) => (
              <div className="work-log-item" key={log.id}>
                <span className="work-log-marker" />
                <div>
                  <strong>{log.action}</strong>
                  <p>{log.detail}</p>
                  <small>{log.time}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export default MyPage
