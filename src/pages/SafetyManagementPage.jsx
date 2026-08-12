import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/SafetyManagementPage.css'

const API_BASE_URL = `${BACKEND_API_URL}/api`
const GENERAL_USER_ROLE = '일반유저'
const COMPANY_ROLE_OPTIONS = ['안전관리자', '관제사', '현장관리자', GENERAL_USER_ROLE]

function CompanyCodeSelect({ value, options, placeholder, disabled = false, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`company-code-select${isOpen ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}>
      <button type="button" onClick={() => !disabled && setIsOpen((open) => !open)} disabled={disabled}>
        <span>{value || placeholder}</span>
        <ExpandMoreRoundedIcon />
      </button>
      {isOpen && <div className="company-code-select-menu">{options.map((option) => <button type="button" className={option === value ? 'is-selected' : ''} key={option} onClick={() => { onChange(option); setIsOpen(false) }}>{option}{option === value && <span>✓</span>}</button>)}</div>}
    </div>
  )
}

function SafetyManagementPage() {
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
  const [companyCodeForms, setCompanyCodeForms] = useState([
    { id: crypto.randomUUID(), role: '', category: '', code: '' },
  ])

  const token = localStorage.getItem('token')
  const authConfig = { headers: { Authorization: `Bearer ${token}` } }
  const userPageSize = 8
  const userPageCount = Math.max(1, Math.ceil(users.length / userPageSize))
  const currentUserPage = Math.min(userPage, userPageCount)
  const pagedUsers = users.slice((currentUserPage - 1) * userPageSize, currentUserPage * userPageSize)
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

  const updateUserCategory = async (userUid, field, value) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/users/${userUid}`, { [field]: value || null }, authConfig)
      setUsers((currentUsers) => currentUsers.map((user) => user.uid === userUid ? response.data : user))
    } catch (error) {
      console.error('사용자 역할/카테고리 수정 실패:', error)
    }
  }

  if (accessState === 'loading') return <div className="safety-access-message">권한을 확인하고 있습니다.</div>
  if (accessState === 'denied') return <div className="safety-access-message">안전관리자만 회사 코드와 사용자 역할을 관리할 수 있습니다.</div>
  if (accessState === 'error') return <div className="safety-access-message">안전관리 설정을 불러오지 못했습니다.</div>

  return (
    <section className="safety-management-page" aria-label="안전 관리 설정">
      <section className="safety-policy-card company-code-card">
        <div className="safety-card-heading safety-heading-row">
          <div><span><GroupsOutlinedIcon /> COMPANY CODE</span><h2>회사 코드</h2></div>
          <div className="company-code-tabs" role="tablist" aria-label="회사 코드 메뉴">
            <button type="button" className={activeCodeTab === 'create' ? 'active' : ''} onClick={() => setActiveCodeTab('create')}>생성</button>
            <button type="button" className={activeCodeTab === 'history' ? 'active' : ''} onClick={() => setActiveCodeTab('history')}>내역</button>
          </div>
        </div>

        {activeCodeTab === 'create' ? (
          <div className="company-code-grid">
            {companyCodeForms.map((form, index) => <div className="company-code-form-row" key={form.id}>
              <label><span>역할</span><CompanyCodeSelect value={form.role} options={COMPANY_ROLE_OPTIONS} placeholder="선택" disabled={isCodeLoading} onChange={(value) => updateCompanyCodeForm(form.id, 'role', value)} /></label>
              <label><span>카테고리</span><CompanyCodeSelect value={form.role === GENERAL_USER_ROLE ? form.category : ''} options={form.role === GENERAL_USER_ROLE ? categories : []} placeholder={form.role === GENERAL_USER_ROLE ? '선택' : '-'} disabled={isCodeLoading || form.role !== GENERAL_USER_ROLE} onChange={(value) => updateCompanyCodeForm(form.id, 'category', value)} /></label>
              <label><span>회사 코드</span><input className="company-code-output" value={form.code} placeholder="생성 이후 표시됩니다" readOnly /></label>
              {index === 0 ? (
                <button className="safety-add-button company-code-create-button" type="button" onClick={() => handleCreateInviteCode(form)} disabled={isCodeLoading || Boolean(form.code)}><AddRoundedIcon /> {form.code ? '생성 완료' : isCodeLoading ? '생성 중' : '생성'}</button>
              ) : (
                <div className="company-code-row-actions">
                  <button className="safety-add-button" type="button" onClick={() => handleCreateInviteCode(form)} disabled={isCodeLoading || Boolean(form.code)}>{form.code ? '완료' : '생성'}</button>
                  <button className="safety-add-button company-code-delete-button" type="button" onClick={() => removeCompanyCodeForm(form.id)} disabled={isCodeLoading}>삭제</button>
                </div>
              )}
            </div>)}
            <div className="company-code-add-row"><button className="safety-add-button" type="button" onClick={addCompanyCodeForm} disabled={isCodeLoading}><AddRoundedIcon /> 추가</button></div>
            {codeMessage && <p className={`company-code-message ${isCodeError ? 'error' : ''}`}>{codeMessage}</p>}
          </div>
        ) : (
          <div className="invite-code-history">
            <div className="invite-code-filters">
              <CompanyCodeSelect value={codeRoleFilter} options={['전체 역할', ...COMPANY_ROLE_OPTIONS]} placeholder="역할 필터" onChange={(value) => { setCodeRoleFilter(value); setCodePage(1) }} />
              <CompanyCodeSelect value={codeStatusFilter} options={['전체 상태', '사용 완료', '미사용']} placeholder="상태 필터" onChange={(value) => { setCodeStatusFilter(value); setCodePage(1) }} />
            </div>
            <div className="invite-code-head"><span>회사 코드</span><span>역할</span><span>카테고리</span><span>상태</span><span>생성일</span></div>
            {pagedInviteCodes.map((inviteCode) => <div className="invite-code-row" key={inviteCode.id}><strong>{inviteCode.code}</strong><span>{inviteCode.role}</span><span>{inviteCode.category || '-'}</span><span className={inviteCode.is_used ? 'used' : 'unused'}>{inviteCode.is_used ? '사용 완료' : '미사용'}</span><span>{new Date(inviteCode.created_at).toLocaleString('ko-KR')}</span></div>)}
            {!pagedInviteCodes.length && <p className="invite-code-empty">조건에 맞는 회사 코드가 없습니다.</p>}
            <div className="invite-code-pagination"><span>총 {inviteCodes.length}건</span><div><button type="button" disabled={currentCodePage === 1} onClick={() => setCodePage((page) => Math.max(1, page - 1))}>이전</button><strong>{currentCodePage} / {codePageCount}</strong><button type="button" disabled={currentCodePage === codePageCount} onClick={() => setCodePage((page) => Math.min(codePageCount, page + 1))}>다음</button></div></div>
          </div>
        )}
      </section>

      <section className="safety-policy-card">
        <div className="safety-card-heading safety-heading-row"><div><span><GroupsOutlinedIcon /> 근무자 역할</span><h2>유저 리스트 및 카테고리 변경</h2></div><button className="safety-add-button" type="button" onClick={() => setIsWorkerRoleEditMode((current) => !current)}><AddRoundedIcon /> {isWorkerRoleEditMode ? '변경 완료' : '역할/카테고리 변경'}</button></div>
        <div className="safety-role-table safety-worker-role-table">
          <div className="safety-role-head"><span>ID</span><span>이름</span><span>역할</span><span>유저카테고리</span></div>
          {pagedUsers.map((user) => <div className="safety-role-row" key={user.uid}><input value={user.user_id} readOnly /><input value={user.name} readOnly />{isWorkerRoleEditMode ? <select value={user.role} onChange={(event) => updateUserCategory(user.uid, 'role', event.target.value)}>{COMPANY_ROLE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input value={user.role} readOnly />}{isWorkerRoleEditMode && user.role === GENERAL_USER_ROLE ? <select value={user.category ?? ''} onChange={(event) => updateUserCategory(user.uid, 'category', event.target.value)}><option value="">미지정</option>{categories.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input value={user.category || '-'} readOnly />}</div>)}
          {!pagedUsers.length && <div className="worker-role-empty">조건에 맞는 근무자가 없습니다.</div>}
        </div>
        <div className="worker-role-pagination"><span>총 {users.length}명</span><div><button type="button" disabled={currentUserPage === 1} onClick={() => setUserPage((page) => Math.max(1, page - 1))}>이전</button><strong>{currentUserPage} / {userPageCount}</strong><button type="button" disabled={currentUserPage === userPageCount} onClick={() => setUserPage((page) => Math.min(userPageCount, page + 1))}>다음</button></div></div>
      </section>
    </section>
  )
}

export default SafetyManagementPage
import { BACKEND_API_URL } from '../config/api.js'
