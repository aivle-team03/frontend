import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/signup.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

function SignupPage() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [verifiedCode, setVerifiedCode] = useState(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [idCheckMessage, setIdCheckMessage] = useState('')
  const [codeCheckMessage, setCodeCheckMessage] = useState('')

  const navigate = useNavigate()

  const handleUserIdChange = (event) => {
    setUserId(event.target.value)
    setIsIdChecked(false)
    setIdCheckMessage('')
  }

  const handleSignupCodeChange = (event) => {
    setSignupCode(event.target.value)
    setVerifiedCode(null)
    setCodeCheckMessage('')
  }

  const handleCheckId = async () => {
    if (!userId.trim()) {
      setIdCheckMessage('아이디를 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/checkid?user_id=${encodeURIComponent(userId.trim())}`)
      const data = await response.json()
      const available = data.message === 'available'
      setIsIdChecked(available)
      setIdCheckMessage(available ? '사용 가능한 아이디입니다.' : '이미 존재하는 아이디입니다.')
    } catch (error) {
      console.error('아이디 중복 확인 실패:', error)
      setIsIdChecked(false)
      setIdCheckMessage('중복 확인 중 오류가 발생했습니다.')
    }
  }

  const handleVerifyCode = async () => {
    if (!signupCode.trim()) {
      setVerifiedCode(null)
      setCodeCheckMessage('회사 코드를 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-code?code=${encodeURIComponent(signupCode.trim())}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || '유효하지 않은 회사 코드입니다.')
      }

      setVerifiedCode(data)
      setCodeCheckMessage('사용 가능한 회사 코드입니다.')
    } catch (error) {
      setVerifiedCode(null)
      setCodeCheckMessage(error.message || '회사 코드 확인 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsError(false)

    if (!userId.trim() || !password.trim() || !name.trim() || !signupCode.trim()) {
      setIsError(true)
      setMessage('모든 필드를 입력해주세요.')
      return
    }

    if (!isIdChecked) {
      setIsError(true)
      setMessage('아이디 중복 확인을 해주세요.')
      return
    }

    if (!verifiedCode || verifiedCode.code !== signupCode.trim()) {
      setIsError(true)
      setMessage('회사 코드 확인을 해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId.trim(),
          password,
          name: name.trim(),
          code: verifiedCode.code,
          // 현 백엔드는 가입 요청의 company_id를 저장하므로 코드 확인 결과를 함께 전달한다.
          company_id: verifiedCode.company_id,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || '회원가입에 실패했습니다.')
      }

      setMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      setIsError(true)
      setMessage(error.message || '서버와 통신할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="logo-area">
        <h2 className="sub-title">AI 소방안전관리 비서</h2>
        <p className="desc">Intelligent Fire Safety Management Assistant</p>
      </div>

      <div className="signup-box">
        <h3 className="main-title">시스템 회원가입</h3>
        <form onSubmit={handleSubmit} className="form">
          <input type="text" placeholder="이름을 입력해주세요" value={name} onChange={(event) => setName(event.target.value)} className="input" disabled={isLoading} />
          <div className="input-with-button" style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input type="text" placeholder="사용할 ID를 입력해주세요" value={userId} onChange={handleUserIdChange} className="input" style={{ flex: 1 }} disabled={isLoading} />
            <button type="button" onClick={handleCheckId} className="button" style={{ width: '100px', margin: 0, padding: '0 10px', fontSize: '13px', whiteSpace: 'nowrap' }} disabled={isLoading}>중복확인</button>
          </div>
          {idCheckMessage && <p className="message" style={{ color: isIdChecked ? '#2e7d32' : '#d32f2f' }}>{idCheckMessage}</p>}
          <input type="password" placeholder="비밀번호를 입력해주세요" value={password} onChange={(event) => setPassword(event.target.value)} className="input" disabled={isLoading} />

          <div className="input-with-button" style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input type="text" placeholder="회사 코드를 입력해주세요" value={signupCode} onChange={handleSignupCodeChange} className="input" style={{ flex: 1 }} disabled={isLoading} />
            <button type="button" onClick={handleVerifyCode} className="button" style={{ width: '100px', margin: 0, padding: '0 10px', fontSize: '13px', whiteSpace: 'nowrap' }} disabled={isLoading}>코드 확인</button>
          </div>
          {codeCheckMessage && <p className="message" style={{ color: verifiedCode ? '#2e7d32' : '#d32f2f' }}>{codeCheckMessage}</p>}
          {verifiedCode && (
            <p className="signup-code-summary">
              {verifiedCode.category ? `${verifiedCode.role} · ${verifiedCode.category} 카테고리로 가입됩니다.` : `${verifiedCode.role} 계정으로 가입됩니다.`}
            </p>
          )}

          {message && <p className="message" style={{ color: isError ? '#d32f2f' : '#2e7d32' }}>{message}</p>}
          <button type="submit" className="button" disabled={isLoading}>{isLoading ? '처리 중...' : '회원가입 완료'}</button>
        </form>
        <div className="links" onClick={() => navigate('/login')}>이미 계정이 있으신가요? <span>로그인하기</span></div>
      </div>
    </div>
  )
}

export default SignupPage
