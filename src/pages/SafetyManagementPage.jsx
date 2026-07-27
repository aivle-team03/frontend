import AddRoundedIcon from '@mui/icons-material/AddRounded'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import { useState, useEffect } from 'react'
import '../styles/SafetyManagementPage.css'
import {
  getStoredSafetyRiskThreshold,
  saveSafetyRiskThreshold,
} from '../utils/checklistStatusStorage'

import axios from 'axios'

const initialPolicy = {
  policy: '근로자의 생명과 건강을 최우선 가치로 두고, 모든 작업에서 위험요인을 사전에 확인하고 개선한다.',
  goal: '중대재해 0건, 위험성 평가 이행률 100%, 개선조치 기한 준수율 95% 이상',
  acceptableRisk: 12,
}

const initialRoles = [
  { id: 1, team: '안전보건관리책임자', owner: '유진', responsibility: '안전보건 방침 승인 및 주요 위험 개선 의사결정' },
  { id: 2, team: '관리감독자', owner: '현장 팀장', responsibility: '작업 전 위험요인 확인, 근로자 교육 및 개선조치 확인' },
  { id: 3, team: '근로자', owner: '전 직원', responsibility: '위험요인 발견 시 즉시 신고하고 안전수칙 준수' },
]

function SafetyManagementPage() {
  
  const [policyForm, setPolicyForm] = useState(() => ({
    ...initialPolicy,
    acceptableRisk: getStoredSafetyRiskThreshold(),
  }))
  const [roles, setRoles] = useState(initialRoles)

  const updatePolicy = (field, value) => {
    setPolicyForm((current) => ({ ...current, [field]: value }))
  }

  const updateRole = (roleId, field, value) => {
    setRoles((currentRoles) => currentRoles.map((role) => (
      role.id === roleId ? { ...role, [field]: value } : role
    )))
  }

  const addRole = () => {
    setRoles((currentRoles) => [
      ...currentRoles,
      { id: Date.now(), team: '', owner: '', responsibility: '' },
    ])
  }

  const saveSettings = () => {
    saveSafetyRiskThreshold(policyForm.acceptableRisk)
    alert('안전보건 관리 설정이 저장되었습니다.')
  }

  const [isWorkerRoleEditMode, setIsWorkerRoleEditMode] = useState(false)
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [userPage, setUserPage] = useState(1)
  const companyRoleOptions = ['일반관리자', '관제사', '현장관리자', '일반유저']
  const [companyCodeForm, setCompanyCodeForm] = useState({
    role: '',
    category: '',
  })
  const isGeneralUserRole = companyCodeForm.role === '일반유저'

  const categoryCode = categories.indexOf(companyCodeForm.category) + 1
  const companyCode = companyCodeForm.role && (!isGeneralUserRole || companyCodeForm.category)
    ? `${companyCodeForm.role}${isGeneralUserRole ? categoryCode : ''}`
    : ''

  const userPageSize = 8
  const userPageCount = Math.max(1, Math.ceil(users.length / userPageSize))
  const currentUserPage = Math.min(userPage, userPageCount)
  const pagedUsers = users.slice((currentUserPage - 1) * userPageSize, currentUserPage * userPageSize)

  const riskPercent = Math.round(((policyForm.acceptableRisk - 1) / 26) * 100)

  useEffect(() => {
    const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const userList = Array.isArray(response.data) ? response.data : (response.data.value ?? [])
      setUsers(userList.map((user) => ({
        uid: user.uid,
        user_id: user.user_id,
        name: user.name,
        role: user.role,
        category: user.category ?? '',
      })))
      setUserPage(1)
    } catch (error) {
      console.error('사용자 리스트 연동 실패:', error)
    }
    }

    fetchUserProfile()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        
        const response = await axios.get('http://127.0.0.1:8000/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const categoryList = Array.isArray(response.data) ? response.data : (response.data.categories ?? [])
        setCategories(categoryList)
      } catch (error) {
        console.error('카테고리 리스트 연동 실패:', error)
      }
    }

    fetchCategories()
  }, [])

    useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        
         const me = await axios.get('http://127.0.0.1:8000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log('현재 로그인 유저:', me.data)
      console.log('현재 role:', me.data.role)

   
      } catch (error) {
        console.error('나의 유저 위치 연동 실패:', error)
      }
    }

    fetchCategories()
  }, [])


  const updateUserCategory = (userUid, value) => {
    setUsers((currentUsers) => currentUsers.map((user) => (
      user.uid === userUid ? { ...user, category: value } : user
    )))

  }

  return (
    <section className="safety-management-page" aria-label="안전보건 관리 설정">
      <section className="safety-policy-card">
        <div className="safety-card-heading">
          <span><FlagOutlinedIcon /> 방침과 목표</span>
          <h2>안전보건 방침과 목표 수립</h2>
        </div>

        <div className="safety-form-grid">
          <label>
            <span>안전보건 방침</span>
            <textarea value={policyForm.policy} onChange={(event) => updatePolicy('policy', event.target.value)} />
          </label>
          <label>
            <span>안전보건 목표</span>
            <textarea value={policyForm.goal} onChange={(event) => updatePolicy('goal', event.target.value)} />
          </label>
        </div>
      </section>

   
      <section className="safety-policy-card">
        <div className="safety-card-heading safety-heading-row">
          <div>
            <span><GroupsOutlinedIcon /> 조직과 역할</span>
            <h2>위험성 평가 실시 조직 구성</h2>
          </div>
          <button className="safety-add-button" type="button" onClick={addRole}>
            <AddRoundedIcon /> 역할 추가
          </button>
        </div>

        <div className="safety-role-table">
          <div className="safety-role-head">
            <span>조직/역할</span>
            <span>담당자</span>
            <span>주요 책임</span>
          </div>
          {roles.map((role) => (
            <div className="safety-role-row" key={role.id}>
              <input value={role.team} placeholder="조직 또는 역할" onChange={(event) => updateRole(role.id, 'team', event.target.value)} />
              <input value={role.owner} placeholder="담당자" onChange={(event) => updateRole(role.id, 'owner', event.target.value)} />
              <input value={role.responsibility} placeholder="주요 책임" onChange={(event) => updateRole(role.id, 'responsibility', event.target.value)} />
            </div>
          ))}
        </div>
      </section>


      <section className="safety-policy-card">
        <div className="safety-card-heading safety-heading-row">
          <div>
            <span><GroupsOutlinedIcon /> COMPANY CODE</span>
            <h2>회사 코드 생성</h2>
          </div>
        </div>

        <div className="company-code-grid">
          <label>
            <span>role</span>
            <select value={companyCodeForm.role} onChange={(event) => setCompanyCodeForm((current) => ({ ...current, role: event.target.value, category: event.target.value === '일반유저' ? current.category : '' }))}>
              <option value="">선택</option>
              {companyRoleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>category</span>
            <select value={companyCodeForm.category} disabled={!isGeneralUserRole} onChange={(event) => setCompanyCodeForm((current) => ({ ...current, category: event.target.value }))}>
              <option value="">선택</option>
              {categories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>companycode</span>
            <input className="company-code-output" value={companyCode} readOnly />
          </label>
          <button className="safety-add-button company-code-create-button" type="button">
            <AddRoundedIcon /> 생성
          </button>
        </div>
      </section>



      <section className="safety-policy-card">
        <div className="safety-card-heading safety-heading-row">
          <div>
            <span><GroupsOutlinedIcon /> 근무자 역할</span>
            <h2>유저 리스트 및 카테고리 변경</h2>
          </div>
          <button className="safety-add-button" type="button" onClick={() => setIsWorkerRoleEditMode((current) => !current)}>
            <AddRoundedIcon /> {isWorkerRoleEditMode ? '변경 완료' : '카테고리 변경'}
          </button>
        </div>

        <div className="safety-role-table safety-worker-role-table">
          <div className="safety-role-head">
            <span>ID</span>
            <span>이름</span>
            <span>역할</span>
            <span>유저카테고리</span>
          </div>
          {pagedUsers.map((user) => (
            <div className="safety-role-row" key={user.uid}>
              <input value={user.user_id} readOnly />
              <input value={user.name} readOnly />
              <input value={user.role} readOnly />
              {isWorkerRoleEditMode ? (
                <select value={user.category} onChange={(event) => updateUserCategory(user.uid, event.target.value)}>
                  <option value="">미지정</option>
                  {categories.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input value={user.category || '미지정'} readOnly />
              )}
            </div>
          ))}
          {!pagedUsers.length && <div className="worker-role-empty">조건에 맞는 근무자가 없습니다.</div>}
        </div>
        <div className="worker-role-pagination">
          <span>총 {users.length}명</span>
          <div>
            <button type="button" disabled={currentUserPage === 1} onClick={() => setUserPage((page) => Math.max(1, page - 1))}>이전</button>
            <strong>{currentUserPage} / {userPageCount}</strong>
            <button type="button" disabled={currentUserPage === userPageCount} onClick={() => setUserPage((page) => Math.min(userPageCount, page + 1))}>다음</button>
          </div>
        </div>
      </section>

      <section className="safety-policy-card">
        <div className="safety-card-heading">
          <span><SecurityOutlinedIcon /> 위험성 기준</span>
          <h2>
            허용가능한 위험도 설정
            <small className="safety-risk-formula">위험도 = 강도 x 빈도</small>
          </h2>
        </div>

        <div className="safety-risk-slider-panel">
          <div className="risk-threshold-summary">
            <span>조치필요항목 설정 기준</span>
            <strong>{policyForm.acceptableRisk}점 이상</strong>
          </div>

          <label className="risk-threshold-control">
            <input
              type="range"
              min="1"
              max="27"
              step="1"
              value={policyForm.acceptableRisk}
              onChange={(event) => updatePolicy('acceptableRisk', Number(event.target.value))}
              style={{ '--risk-progress': `${riskPercent}%` }}
              aria-label="허용가능한 위험도 기준"
            />
            <div className="risk-threshold-scale">
              <span>1</span>
              <span>9</span>
              <span>18</span>
              <span>27</span>
            </div>
          </label>
        </div>

        <p className="safety-risk-note">
          체크리스트에서 계산된 위험도가 <strong>{policyForm.acceptableRisk}점 이상</strong>이면 조치필요항목으로 설정됩니다.
        </p>
      </section>

      <div className="safety-page-actions">
        <button type="button" onClick={saveSettings}>
          <SaveRoundedIcon /> 저장
        </button>
      </div>
    </section>
  )
}

export default SafetyManagementPage
