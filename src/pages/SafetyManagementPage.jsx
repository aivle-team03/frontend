import AddRoundedIcon from '@mui/icons-material/AddRounded'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { useState, useEffect } from 'react'
import '../styles/SafetyManagementPage.css'

import axios from 'axios'

function SafetyManagementPage() {
  const saveSettings = () => {
    alert('안전보건 관리 설정이 저장되었습니다.')
  }

  const [isWorkerRoleEditMode, setIsWorkerRoleEditMode] = useState(false)
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [userPage, setUserPage] = useState(1)
  const companyRoleOptions = ['안전관리자', '관제사', '현장관리자', '일반유저']
  const [companyCodeForm, setCompanyCodeForm] = useState({
    companyName: '',
    role: '',
  })

  const roleCode = companyRoleOptions.includes(companyCodeForm.role)
    ? String(companyRoleOptions.indexOf(companyCodeForm.role) + 1).padStart(2, '0')
    : ''
  const companyCode = companyCodeForm.companyName.trim() && roleCode
    ? `${companyCodeForm.companyName.trim()}${roleCode}`
    : ''

  const userPageSize = 8
  const userPageCount = Math.max(1, Math.ceil(users.length / userPageSize))
  const currentUserPage = Math.min(userPage, userPageCount)
  const pagedUsers = users.slice((currentUserPage - 1) * userPageSize, currentUserPage * userPageSize)

  useEffect(() => {
    const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get('http://127.0.0.1:8000/api/admin/users', {
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


  const updateUserCategory = async (userUid, field, value) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const nextValue = field === 'category' && value === '' ? '미지정' : value
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/admin/users/${userUid}`,
        { [field]: nextValue },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      setUsers((currentUsers) => currentUsers.map((user) => (
        user.uid === userUid ? { ...user, [field]: nextValue } : user
      )))
      console.log('카테고리 수정 성공:', response.data)
    } catch (error) {
      console.error('카테고리 수정 실패:', error)
    }
  }

  return (
    <section className="safety-management-page" aria-label="안전보건 관리 설정">
      <section className="safety-policy-card">
        <div className="safety-card-heading safety-heading-row">
          <div>
            <span><GroupsOutlinedIcon /> COMPANY CODE</span>
            <h2>회사 코드 생성</h2>
          </div>
        </div>

        <div className="company-code-grid">
          <label>
            <span>회사명</span>
            <input value={companyCodeForm.companyName} onChange={(event) => setCompanyCodeForm((current) => ({ ...current, companyName: event.target.value }))} placeholder="회사명 입력" />
          </label>
          <label>
            <span>role</span>
            <select value={companyCodeForm.role} onChange={(event) => setCompanyCodeForm((current) => ({ ...current, role: event.target.value }))}>
              <option value="">선택</option>
              {companyRoleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
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
            <AddRoundedIcon /> {isWorkerRoleEditMode ? '변경 완료' : '역할/카테고리 변경'}
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
              {isWorkerRoleEditMode ? (
                <select value={user.role} onChange={(event) => updateUserCategory(user.uid, 'role', event.target.value)}>
                  <option value="">선택</option>
                  {companyRoleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input value={user.role} readOnly />
              )}
              {isWorkerRoleEditMode ? (
                <select value={user.category === '미지정' ? '' : (user.category ?? '')} onChange={(event) => updateUserCategory(user.uid, 'category', event.target.value)}>
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
    </section>
  )
}

export default SafetyManagementPage
