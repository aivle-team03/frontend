import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { clearAuthSession } from '../api/authInterceptor.js'
import { useUiLanguage } from '../utils/uiLanguage.js'
import { maskName } from '../utils/userPrivacy.js'
import '../styles/MyPage.css'

const API_BASE_URL = BACKEND_API_URL

function MyPage() {
  const { t } = useUiLanguage()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('password')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [withdrawalPassword, setWithdrawalPassword] = useState('')
  const [isWithdrawalAcknowledged, setIsWithdrawalAcknowledged] = useState(false)
  const [withdrawalError, setWithdrawalError] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawalComplete, setWithdrawalComplete] = useState(false)

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/me`)
        const userData = response.data
        setUser({
          name: userData.name || userData.user_id || '관리자',
          email: userData.email || '',
          role: userData.role || '안전관리자',
          // Hide the legacy mock department until a verified profile field is available.
          department: '',
        })
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMyProfile()
  }, [])

  const selectTab = (tab) => {
    setActiveTab(tab)
    setPasswordError('')
    setPasswordSuccess('')
    setWithdrawalError('')
  }

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호 확인이 일치하지 않습니다.')
      return
    }
    if (currentPassword === newPassword) {
      setPasswordError('새 비밀번호는 현재 비밀번호와 다르게 설정해 주세요.')
      return
    }

    setIsChangingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')
    try {
      await axios.patch(`${API_BASE_URL}/api/users/me/password`, {
        old_password: currentPassword,
        new_password: newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordSuccess('비밀번호가 변경되었습니다.')
    } catch (error) {
      setPasswordError(error.response?.data?.detail || '비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleWithdrawal = async (event) => {
    event.preventDefault()
    if (!withdrawalPassword) {
      setWithdrawalError('본인 확인을 위해 현재 비밀번호를 입력해 주세요.')
      return
    }
    if (!isWithdrawalAcknowledged) {
      setWithdrawalError('탈퇴 안내를 확인했다는 동의가 필요합니다.')
      return
    }

    setIsWithdrawing(true)
    setWithdrawalError('')
    try {
      await axios.delete(`${API_BASE_URL}/api/users/me`, { data: { password: withdrawalPassword } })
      clearAuthSession()
      setWithdrawalComplete(true)
      window.setTimeout(() => window.location.replace('/login'), 900)
    } catch (error) {
      const status = error.response?.status
      setWithdrawalError(
        status === 400
          ? '현재 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.'
          : status === 401
            ? '로그인 정보가 만료되었습니다. 다시 로그인한 뒤 시도해 주세요.'
            : '회원 탈퇴를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (loading) return <div className="loading-container">{t('내 정보를 불러오는 중…')}</div>
  if (!user) return <div className="loading-container">{t('사용자 정보를 불러오지 못했습니다. 로그인 상태를 확인해 주세요.')}</div>

  return (
    <section className="my-page-container" aria-label={t('마이페이지')}>
      <article className="my-profile-hero">
        <div className="my-profile-main">
          <span className="my-profile-avatar" aria-hidden="true"><AccountCircleRoundedIcon /></span>
          <div className="my-profile-copy">
            <span className="my-role-badge"><ShieldOutlinedIcon />{t(user.role)}</span>
            <h2>{maskName(user.name)}</h2>
            {user.department && <p>{user.department}</p>}
            {user.email && <span className="my-email">{user.email}</span>}
          </div>
        </div>
      </article>

      <article className="account-settings-card">
        <div className="account-settings-heading">
          <h3>{t('계정 설정')}</h3>
          <p>{t('계정 정보와 보안 설정을 관리할 수 있습니다.')}</p>
        </div>

        <div className="account-settings-tabs" role="tablist" aria-label={t('계정 설정 메뉴')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'password'}
            className={activeTab === 'password' ? 'is-active' : ''}
            onClick={() => selectTab('password')}
          >
            {t('비밀번호 변경')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'withdrawal'}
            className={activeTab === 'withdrawal' ? 'is-active is-danger' : 'is-danger'}
            onClick={() => selectTab('withdrawal')}
          >
            {t('회원탈퇴')}
          </button>
        </div>

        {activeTab === 'password' ? (
          <section className="account-settings-panel" role="tabpanel" aria-label={t('비밀번호 변경')}>
            <p className="account-settings-guide">{t('안전을 위해 현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.')}</p>
            <form className="account-settings-form" onSubmit={handlePasswordChange}>
              <label>
                <span>{t('현재 비밀번호')}</span>
                <span className="password-input-wrap">
                  <LockOutlinedIcon aria-hidden="true" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    autoComplete="current-password"
                    placeholder={t('현재 비밀번호를 입력하세요')}
                    disabled={isChangingPassword}
                  />
                </span>
              </label>
              <label>
                <span>{t('새 비밀번호')}</span>
                <span className="password-input-wrap">
                  <LockOutlinedIcon aria-hidden="true" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    autoComplete="new-password"
                    placeholder={t('새 비밀번호를 입력하세요')}
                    disabled={isChangingPassword}
                  />
                </span>
              </label>
              <label>
                <span>{t('새 비밀번호 확인')}</span>
                <span className="password-input-wrap">
                  <LockOutlinedIcon aria-hidden="true" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    autoComplete="new-password"
                    placeholder={t('새 비밀번호를 한 번 더 입력하세요')}
                    disabled={isChangingPassword}
                  />
                </span>
              </label>
              {passwordError && <p className="account-settings-message is-error" role="alert">{t(passwordError)}</p>}
              {passwordSuccess && <p className="account-settings-message is-success" role="status">{t(passwordSuccess)}</p>}
              <button className="account-settings-submit" type="submit" disabled={isChangingPassword}>
                {t(isChangingPassword ? '변경 중…' : '비밀번호 변경')}
              </button>
            </form>
          </section>
        ) : (
          <section className="account-settings-panel withdrawal-panel" role="tabpanel" aria-label={t('회원탈퇴')}>
            {withdrawalComplete ? (
              <div className="withdrawal-complete">
                <DeleteForeverOutlinedIcon aria-hidden="true" />
                <h2>{t('회원 탈퇴가 완료되었습니다.')}</h2>
                <p>{t('안전하게 로그아웃 처리한 뒤 로그인 화면으로 이동합니다.')}</p>
              </div>
            ) : (
              <>
                <div className="withdrawal-tab-notice">
                  <WarningAmberRoundedIcon aria-hidden="true" />
                  <div>
                    <strong>{t('탈퇴 전 확인해 주세요')}</strong>
                    <p>{t('회원 탈퇴가 완료되면 계정은 즉시 삭제되며, 같은 계정으로 다시 로그인하거나 복구할 수 없습니다.')}</p>
                    <ul>
                      <li>{t('계정에 저장된 로그인 정보와 개인 설정이 삭제됩니다.')}</li>
                      <li>{t('작성한 게시글·보고서·점검 이력 등 업무 기록은 작성자 정보 없이 유지될 수 있습니다.')}</li>
                      <li>{t('계속 이용할 계획이라면 탈퇴 대신 비밀번호 변경을 이용해 주세요.')}</li>
                    </ul>
                  </div>
                </div>
                <form className="account-settings-form" onSubmit={handleWithdrawal}>
                  <label>
                    <span>{t('현재 비밀번호')}</span>
                    <span className="password-input-wrap">
                      <LockOutlinedIcon aria-hidden="true" />
                      <input
                        type="password"
                        value={withdrawalPassword}
                        onChange={(event) => {
                          setWithdrawalPassword(event.target.value)
                          setWithdrawalError('')
                        }}
                        autoComplete="current-password"
                        placeholder={t('현재 비밀번호를 입력하세요')}
                        disabled={isWithdrawing}
                      />
                    </span>
                  </label>
                  <label className="withdrawal-acknowledgement">
                    <input
                      type="checkbox"
                      checked={isWithdrawalAcknowledged}
                      onChange={(event) => {
                        setIsWithdrawalAcknowledged(event.target.checked)
                        setWithdrawalError('')
                      }}
                      disabled={isWithdrawing}
                    />
                    <span>{t('탈퇴 시 계정을 복구할 수 없음을 확인했습니다.')}</span>
                  </label>
                  {withdrawalError && <p className="account-settings-message is-error" role="alert">{t(withdrawalError)}</p>}
                  <button className="account-settings-submit withdrawal-submit" type="submit" disabled={isWithdrawing}>
                    {t(isWithdrawing ? '탈퇴 처리 중…' : '회원 탈퇴')}
                  </button>
                </form>
              </>
            )}
          </section>
        )}
      </article>
    </section>
  )
}

export default MyPage
import { BACKEND_API_URL } from '../config/api.js'
