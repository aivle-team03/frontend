import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
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
  const { user: defaultUser, workLogs, notifications } = MY_PAGE_MOCK_DATA
  const [user, setUser] = useState(defaultUser)
  const [draftProfile, setDraftProfile] = useState(() => ({ name: user.name, email: user.email }))
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileError, setProfileError] = useState({})
  const [profileSaved, setProfileSaved] = useState(false)
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

  const startProfileEdit = () => {
    setDraftProfile({ name: user.name, email: user.email })
    setProfileError({})
    setProfileSaved(false)
    setIsEditingProfile(true)
  }

  const cancelProfileEdit = () => {
    setDraftProfile({ name: user.name, email: user.email })
    setProfileError({})
    setIsEditingProfile(false)
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setDraftProfile((currentProfile) => ({ ...currentProfile, [name]: value }))
    setProfileError((currentError) => ({ ...currentError, [name]: '' }))
  }

  const saveProfile = (event) => {
    event.preventDefault()
    const nextError = {}
    const trimmedName = draftProfile.name.trim()
    const trimmedEmail = draftProfile.email.trim()

    if (!trimmedName) nextError.name = '이름을 입력해 주세요.'
    if (!trimmedEmail) nextError.email = '이메일을 입력해 주세요.'
    else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) nextError.email = '이메일 형식을 확인해 주세요.'

    if (Object.keys(nextError).length) {
      setProfileError(nextError)
      return
    }

    const nextUser = { ...user, name: trimmedName, email: trimmedEmail }
    // TODO: 백엔드 연동 시 서버 저장 성공 후 화면 상태를 갱신합니다.
    setUser(nextUser)
    setDraftProfile({ name: trimmedName, email: trimmedEmail })
    setIsEditingProfile(false)
    setProfileSaved(true)
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

      <article className="my-page-card profile-settings-card">
        <div className="my-card-heading profile-settings-heading">
          <div className="profile-settings-title">
            <span className="my-card-icon"><AccountCircleRoundedIcon /></span>
            <div>
              <h3>내 정보</h3>
              <p>이름과 이메일 등 계정 기본 정보를 관리합니다.</p>
            </div>
          </div>
          {!isEditingProfile && (
            <button className="profile-edit-button" type="button" onClick={startProfileEdit}>
              <EditOutlinedIcon /> 정보 수정
            </button>
          )}
        </div>

        <form className="profile-settings-form" onSubmit={saveProfile}>
          <div className="profile-form-field">
            <label htmlFor="profile-name">이름</label>
            {isEditingProfile ? (
              <>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={draftProfile.name}
                  onChange={handleProfileChange}
                  aria-invalid={Boolean(profileError.name)}
                  aria-describedby={profileError.name ? 'profile-name-error' : undefined}
                  autoComplete="name"
                />
                {profileError.name && <small id="profile-name-error" className="profile-field-error">{profileError.name}</small>}
              </>
            ) : <strong>{user.name}</strong>}
          </div>
          <div className="profile-form-field">
            <label htmlFor="profile-email">이메일</label>
            {isEditingProfile ? (
              <>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={draftProfile.email}
                  onChange={handleProfileChange}
                  aria-invalid={Boolean(profileError.email)}
                  aria-describedby={profileError.email ? 'profile-email-error' : undefined}
                  autoComplete="email"
                />
                {profileError.email && <small id="profile-email-error" className="profile-field-error">{profileError.email}</small>}
              </>
            ) : <strong>{user.email}</strong>}
          </div>
          <div className="profile-form-field profile-readonly-field">
            <span>소속 / 권한</span>
            <strong>{user.department} · {user.role}</strong>
          </div>
          {isEditingProfile && (
            <div className="profile-form-actions">
              <button className="profile-cancel-button" type="button" onClick={cancelProfileEdit}>
                <CloseRoundedIcon /> 취소
              </button>
              <button className="profile-save-button" type="submit">
                <SaveOutlinedIcon /> 변경 사항 저장
              </button>
            </div>
          )}
          {profileSaved && <p className="profile-save-message" role="status">내 정보가 저장되었습니다.</p>}
        </form>
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
