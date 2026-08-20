import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useUiLanguage } from '../utils/uiLanguage.js'
import { maskName } from '../utils/userPrivacy.js'
import '../styles/SafetyManagementPage.css'

const API_BASE_URL = `${BACKEND_API_URL}/api`
const GENERAL_USER_ROLE = '일반유저'
const COMPANY_ROLE_OPTIONS = ['안전관리자', '관제사', '현장관리자', GENERAL_USER_ROLE]

function CompanyCodeSelect({ value, options, placeholder, disabled = false, onChange }) {
  const { t } = useUiLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`company-code-select${isOpen ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}>
      <button type="button" onClick={() => !disabled && setIsOpen((open) => !open)} disabled={disabled}>
        <span>{t(value || placeholder)}</span>
        <ExpandMoreRoundedIcon />
      </button>
      {isOpen && <div className="company-code-select-menu">{options.map((option) => <button type="button" className={option === value ? 'is-selected' : ''} key={option} onClick={() => { onChange(option); setIsOpen(false) }}>{t(option)}{option === value && <span>✓</span>}</button>)}</div>}
    </div>
  )
}

function SafetyManagementPage() {
  const { language, t } = useUiLanguage()
  const [isWorkerRoleEditMode, setIsWorkerRoleEditMode] = useState(false)
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [inviteCodes, setInviteCodes] = useState([])
  const [codeRoleFilter, setCodeRoleFilter] = useState('전체 역할')
  const [codeStatusFilter, setCodeStatusFilter] = useState('전체 상태')
  const [codePage, setCodePage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const [activeCodeTab, setActiveCodeTab] = useState('create')
  const [accessState, setAccessState] = useState('loading')
  const [isCodeLoading, setIsCodeLoading] = useState(false)
  const [codeMessage, setCodeMessage] = useState('')
  const [isCodeError, setIsCodeError] = useState(false)
  const [resetCodeInfo, setResetCodeInfo] = useState(null)
  const [selectedResetUid, setSelectedResetUid] = useState(null)
  const [issuingResetUid, setIssuingResetUid] = useState(null)
  const [companyCodeForms, setCompanyCodeForms] = useState([
    { id: crypto.randomUUID(), role: '', category: '', code: '' },
  ])

  const token = localStorage.getItem('token')
  const authConfig = { headers: { Authorization: `Bearer ${token}` } }
  const userPageSize = 8
  const userPageCount = Math.max(1, Math.ceil(users.length / userPageSize))
  const currentUserPage = Math.min(userPage, userPageCount)
  const pagedUsers = users.slice((currentUserPage - 1) * userPageSize, currentUserPage * userPageSize)
  // 현재 페이지에 보이는 사람만 발급 대상이 된다. 페이지를 넘기면 선택이 자연히 풀린다.
  const selectedResetUser = pagedUsers.find((user) => user.uid === selectedResetUid) ?? null
  const codePageSize = 10
  const filteredInviteCodes = inviteCodes.filter((inviteCode) => {
    const matchesRole = codeRoleFilter === '전체 역할' || inviteCode.role === codeRoleFilter
    const status = inviteCode.is_used ? '사용 완료' : '미사용'
    return matchesRole && (codeStatusFilter === '전체 상태' || status === codeStatusFilter)
  })
  const codePageCount = Math.max(1, Math.ceil(filteredInviteCodes.length / codePageSize))
  const currentCodePage = Math.min(codePage, codePageCount)
  const pagedInviteCodes = filteredInviteCodes.slice((currentCodePage - 1) * codePageSize, currentCodePage * codePageSize)
  const loadInviteCodes = async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/invite-codes`, authConfig)
    setInviteCodes(Array.isArray(response.data) ? response.data : [])
  }

  useEffect(() => {
    const loadAdminData = async () => {
      if (!token) {
        setAccessState('denied')
        return
      }

      try {
        const meResponse = await axios.get(`${API_BASE_URL}/users/me`, authConfig)
        if (meResponse.data.role !== '안전관리자') {
          setAccessState('denied')
          return
        }

        setAccessState('allowed')
        const [usersResponse, categoriesResponse, codesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/users`, authConfig),
          axios.get(`${API_BASE_URL}/admin/categories`, authConfig),
          axios.get(`${API_BASE_URL}/admin/invite-codes`, authConfig),
        ])
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : [])
        setCategories(categoriesResponse.data?.categories ?? [])
        setInviteCodes(Array.isArray(codesResponse.data) ? codesResponse.data : [])
      } catch (error) {
        console.error('안전관리 설정 조회 실패:', error)
        setAccessState(error.response?.status === 403 ? 'denied' : 'error')
      }
    }

    loadAdminData()
  }, [])

  const updateCompanyCodeForm = (id, field, value) => {
    setCompanyCodeForms((forms) => forms.map((form) => {
      if (form.id !== id) return form
      if (field === 'role') return { ...form, role: value, category: '', code: '' }
      return { ...form, [field]: value, code: '' }
    }))
  }

  const addCompanyCodeForm = () => {
    setCompanyCodeForms((forms) => [...forms, { id: crypto.randomUUID(), role: '', category: '', code: '' }])
  }

  const removeCompanyCodeForm = (id) => {
    setCompanyCodeForms((forms) => forms.filter((form) => form.id !== id))
  }

  const handleCreateInviteCode = async (form) => {
    setCodeMessage('')
    setIsCodeError(false)
    if (!form.role) {
      setIsCodeError(true)
      setCodeMessage('역할을 선택해주세요.')
      return
    }
    if (form.role === GENERAL_USER_ROLE && !form.category) {
      setIsCodeError(true)
      setCodeMessage('카테고리를 선택해주세요.')
      return
    }

    setIsCodeLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/invite-codes`, {
        role: form.role,
        category: form.role === GENERAL_USER_ROLE ? form.category : null,
      }, authConfig)
      setCompanyCodeForms((forms) => forms.map((current) => current.id === form.id ? { ...current, code: response.data.code } : current))
      await loadInviteCodes()
    } catch (error) {
      setIsCodeError(true)
      setCodeMessage(error.response?.data?.detail || '회사 코드 생성에 실패했습니다.')
    } finally {
      setIsCodeLoading(false)
    }
  }

  // 관리자가 특정 사용자에게 1회용 비밀번호 재설정 코드를 발급한다.
  // 기존 가입 코드를 다시 알려주지 않는다. 그 값은 이미 전달돼 회수할 수 없다.
  const issueResetCode = async (user) => {
    setIssuingResetUid(user.uid)
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/users/${user.uid}/password-reset-code`, {}, authConfig)
      setResetCodeInfo({ name: user.name, ...response.data })
      setSelectedResetUid(null)
    } catch (error) {
      window.alert(error.response?.data?.detail || t('재설정 코드 발급에 실패했습니다.'))
    } finally {
      setIssuingResetUid(null)
    }
  }

  const updateUserCategory = async (userUid, field, value) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/users/${userUid}`, { [field]: value || null }, authConfig)
      setUsers((currentUsers) => currentUsers.map((user) => user.uid === userUid ? response.data : user))
    } catch (error) {
      console.error('사용자 역할/카테고리 수정 실패:', error)
    }
  }

  if (accessState === 'loading') return <div className="safety-access-message">{t('권한을 확인하고 있습니다.')}</div>
  if (accessState === 'denied') return <div className="safety-access-message">{t('안전관리자만 회사 코드와 사용자 역할을 관리할 수 있습니다.')}</div>
  if (accessState === 'error') return <div className="safety-access-message">{t('안전관리 설정을 불러오지 못했습니다.')}</div>

  return (
    <section className="safety-management-page" aria-label={t('안전 관리 설정')}>
      <section className="safety-policy-card company-code-card">
        <div className="safety-card-heading safety-heading-row">
          <div><span><GroupsOutlinedIcon /> COMPANY CODE</span><h2>{t('회사 코드')}</h2></div>
          <div className={`company-code-tabs${language === 'en' ? ' is-english' : ''}`} role="tablist" aria-label={t('회사 코드 메뉴')}>
            <button type="button" className={activeCodeTab === 'create' ? 'active' : ''} onClick={() => setActiveCodeTab('create')}>{t('코드 생성')}</button>
            <button type="button" className={activeCodeTab === 'history' ? 'active' : ''} onClick={() => setActiveCodeTab('history')}>{t('내역')}</button>
          </div>
        </div>

        {activeCodeTab === 'create' ? (
          <div className="company-code-grid">
            {companyCodeForms.map((form, index) => <div className="company-code-form-row" key={form.id}>
              <label><span>{t('역할')}</span><CompanyCodeSelect value={form.role} options={COMPANY_ROLE_OPTIONS} placeholder="선택" disabled={isCodeLoading} onChange={(value) => updateCompanyCodeForm(form.id, 'role', value)} /></label>
              <label><span>{t('카테고리')}</span><CompanyCodeSelect value={form.role === GENERAL_USER_ROLE ? form.category : ''} options={form.role === GENERAL_USER_ROLE ? categories : []} placeholder={form.role === GENERAL_USER_ROLE ? '선택' : '-'} disabled={isCodeLoading || form.role !== GENERAL_USER_ROLE} onChange={(value) => updateCompanyCodeForm(form.id, 'category', value)} /></label>
              <label><span>{t('회사 코드')}</span><input className="company-code-output" value={form.code} placeholder={t('생성 이후 표시됩니다')} readOnly /></label>
              {index === 0 ? (
                <button className="safety-add-button company-code-create-button" type="button" onClick={() => handleCreateInviteCode(form)} disabled={isCodeLoading || Boolean(form.code)}><AddRoundedIcon /> {form.code ? t('생성 완료') : isCodeLoading ? t('생성 중') : t('코드 생성')}</button>
              ) : (
                <div className="company-code-row-actions">
                  <button className="safety-add-button" type="button" onClick={() => handleCreateInviteCode(form)} disabled={isCodeLoading || Boolean(form.code)}>{form.code ? t('완료') : t('코드 생성')}</button>
                  <button className="safety-add-button company-code-delete-button" type="button" onClick={() => removeCompanyCodeForm(form.id)} disabled={isCodeLoading}>{t('삭제')}</button>
                </div>
              )}
            </div>)}
            <div className="company-code-add-row"><button className="safety-add-button" type="button" onClick={addCompanyCodeForm} disabled={isCodeLoading}><AddRoundedIcon /> {t('추가')}</button></div>
            {codeMessage && <p className={`company-code-message ${isCodeError ? 'error' : ''}`}>{codeMessage}</p>}
          </div>
        ) : (
          <div className="invite-code-history">
            <div className="invite-code-filters">
              <CompanyCodeSelect value={codeRoleFilter} options={['전체 역할', ...COMPANY_ROLE_OPTIONS]} placeholder="역할 필터" onChange={(value) => { setCodeRoleFilter(value); setCodePage(1) }} />
              <CompanyCodeSelect value={codeStatusFilter} options={['전체 상태', '사용 완료', '미사용']} placeholder="상태 필터" onChange={(value) => { setCodeStatusFilter(value); setCodePage(1) }} />
            </div>
            <div className="invite-code-head"><span>{t('회사 코드')}</span><span>{t('역할')}</span><span>{t('카테고리')}</span><span>{t('상태')}</span><span>{t('생성일')}</span></div>
            {pagedInviteCodes.map((inviteCode) => <div className="invite-code-row" key={inviteCode.id}><strong>{inviteCode.code}</strong><span>{t(inviteCode.role)}</span><span>{t(inviteCode.category || '-')}</span><span className={inviteCode.is_used ? 'used' : 'unused'}>{t(inviteCode.is_used ? '사용 완료' : '미사용')}</span><span>{new Date(inviteCode.created_at).toLocaleString(language === 'en' ? 'en-US' : 'ko-KR')}</span></div>)}
            {!pagedInviteCodes.length && <p className="invite-code-empty">{t('조건에 맞는 회사 코드가 없습니다.')}</p>}
            <div className="invite-code-pagination"><span>{t('총')} {inviteCodes.length}{t('건')}</span><div><button type="button" disabled={currentCodePage === 1} onClick={() => setCodePage((page) => Math.max(1, page - 1))}>{t('이전')}</button><strong>{currentCodePage} / {codePageCount}</strong><button type="button" disabled={currentCodePage === codePageCount} onClick={() => setCodePage((page) => Math.min(codePageCount, page + 1))}>{t('다음')}</button></div></div>
          </div>
        )}
      </section>

      <section className="safety-policy-card">
        <div className="safety-card-heading safety-heading-row"><div><span><GroupsOutlinedIcon /> {t('근무자 역할')}</span><h2>{t('유저 리스트 및 카테고리 변경')}</h2></div><div className="safety-heading-actions"><button className="safety-reset-code-button" type="button" disabled={!selectedResetUser || issuingResetUid !== null} onClick={() => issueResetCode(selectedResetUser)}>{issuingResetUid !== null ? t('발급 중...') : selectedResetUser ? `${t('재설정 코드 발급')} · ${maskName(selectedResetUser.name)}` : t('재설정 코드 발급')}</button><button className="safety-add-button" type="button" onClick={() => { setSelectedResetUid(null); setIsWorkerRoleEditMode((current) => !current) }}><AddRoundedIcon /> {t(isWorkerRoleEditMode ? '변경 완료' : '역할/카테고리 변경')}</button></div></div>
        <div className="safety-role-table safety-worker-role-table">
          <div className="safety-role-head"><span>ID</span><span>{t('이름')}</span><span>{t('역할')}</span><span>{t('유저카테고리')}</span></div>
          {pagedUsers.map((user) => <div className={`safety-role-row${selectedResetUid === user.uid ? ' is-selected' : ''}`} key={user.uid} onClick={() => !isWorkerRoleEditMode && setSelectedResetUid((current) => current === user.uid ? null : user.uid)}><input value={user.user_id} readOnly /><input value={maskName(user.name)} readOnly />{isWorkerRoleEditMode ? <select value={user.role} onChange={(event) => updateUserCategory(user.uid, 'role', event.target.value)}>{COMPANY_ROLE_OPTIONS.map((option) => <option key={option} value={option}>{t(option)}</option>)}</select> : <input value={t(user.role)} readOnly />}{isWorkerRoleEditMode && user.role === GENERAL_USER_ROLE ? <select value={user.category ?? ''} onChange={(event) => updateUserCategory(user.uid, 'category', event.target.value)}><option value="">{t('미지정')}</option>{categories.map((option) => <option key={option} value={option}>{t(option)}</option>)}</select> : <input value={t(user.category || '-')} readOnly />}</div>)}
          {!pagedUsers.length && <div className="worker-role-empty">{t('조건에 맞는 근무자가 없습니다.')}</div>}
        </div>
        <div className="worker-role-pagination"><span>{t('총')} {users.length}{t('명')}</span><div><button type="button" disabled={currentUserPage === 1} onClick={() => setUserPage((page) => Math.max(1, page - 1))}>{t('이전')}</button><strong>{currentUserPage} / {userPageCount}</strong><button type="button" disabled={currentUserPage === userPageCount} onClick={() => setUserPage((page) => Math.min(userPageCount, page + 1))}>{t('다음')}</button></div></div>
      </section>

      {resetCodeInfo && (
        <div className="safety-reset-modal-backdrop" role="presentation" onMouseDown={() => setResetCodeInfo(null)}>
          <section className="safety-reset-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <h3>{t('비밀번호 재설정 코드')}</h3>
            <p>{resetCodeInfo.target_name} {t('님에게 아래 코드를 전달하세요.')}</p>
            <strong className="safety-reset-code">{resetCodeInfo.code}</strong>
            <p className="safety-reset-note">
              {t('발급 후')} {resetCodeInfo.expires_in_hours}{t('시간 동안 한 번만 사용할 수 있으며, 이 계정에만 적용됩니다.')}
              <br />
              {t('창을 닫으면 다시 볼 수 없습니다.')}
            </p>
            <div className="safety-reset-actions">
              <button type="button" onClick={() => navigator.clipboard?.writeText(resetCodeInfo.code)}>{t('코드 복사')}</button>
              <button type="button" className="is-primary" onClick={() => setResetCodeInfo(null)}>{t('확인')}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default SafetyManagementPage
import { BACKEND_API_URL } from '../config/api.js'
