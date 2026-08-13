import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BACKEND_API_URL } from '../config/api.js'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import '../styles/Signup.css'

const API_BASE_URL = `${BACKEND_API_URL}/api`

function SignupPage() {
  const [step, setStep] = useState(1)

  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(true)

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

  const allChecked = termsChecked && privacyChecked
  const handleAllCheck = (e) => {
    const checked = e.target.checked
    setTermsChecked(checked)
    setPrivacyChecked(checked)
  }

  const handleNextStep = () => {
    if (!allChecked) {
      alert('필수 약관에 모두 동의해주세요.')
      return
    }
    setStep(2)
  }

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
        <h3 className="main-title">
          {step === 1 ? '약관 동의' : '시스템 회원가입'}
        </h3>

        {/* STEP 1: 약관 동의 화면 */}
        {step === 1 && (
          <div className="terms-step-wrapper">

            <div className="terms-list">
              {/* 이용약관 동의 */}
              <div className="terms-item">
                <div className="terms-item-header">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={termsChecked}
                      onChange={(e) => setTermsChecked(e.target.checked)}
                    />
                    <span><strong>[필수]</strong> BOSS 이용약관 동의</span>
                  </label>
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setTermsOpen(!termsOpen)}
                  >
                    {termsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </button>
                </div>
                {termsOpen && (
                  <div className="terms-item-content">
                    <p>제1조 (목적)</p>
                    <p>본 약관은 주식회사 BOSS(이하 "회사")가 제공하는 시설안전 관리 플랫폼 BOSS 서비스(이하 "서비스")를 이용함에 있어 회사와 회원과의 권리, 의무, 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>

                    <p>제2조 (약관의 효력 및 변경)</p>
                    <p>1. 본 약관은 회원 동의 후 가입 시 효력이 발생합니다.<br />2. 회사는 필요 시 약관을 개정할 수 있으며, 개정 시 적용 7일 전(불리한 변경은 30일 전) 공지합니다.</p>

                    <p>제3조 (약관 외 준칙)</p>
                    <p>본 약관에 명시되지 않은 사항은 관계 법령 및 개별 운영정책에 따릅니다.</p>

                    <p>제4조 (용어의 정의)</p>
                    <p>1. "서비스": CCTV 모니터링, 체크리스트, 조치이력, 위험도 관리, AI 비서 등 시설안전 관리를 위한 AI 플랫폼<br />2. "회원": 약관 동의 후 계정을 발급받은 자<br />3. "회사 코드": 소속 사업장 식별을 위한 승인 코드</p>

                    <p>제5조 (서비스 이용계약의 체결)</p>
                    <p>이용계약은 회원이 신청 양식에 필수 정보를 기재하여 회원가입을 신청하고, 회사가 이를 승낙함으로써 체결됩니다.</p>

                    <p>제6조 (이용신청에 대한 승낙의 제한)</p>
                    <p>타인 명의 도용, 허위 사실 기재, 미승인 회사 코드 사용, 시스템 악용 시 가입 승낙이 제한되거나 계약이 해지될 수 있습니다.</p>

                    <p>제7조 (회원정보 변경 및 보호)</p>
                    <p>회원은 개인정보를 상시 수정할 수 있으나 ID는 수정 불가합니다. 정보 변경 미이행으로 인한 불이익은 회원이 부담합니다.</p>

                    <p>제8조 (서비스의 이용 개시 및 제공)</p>
                    <p>서비스는 연중무휴 24시간 제공을 원칙으로 하되, 점검 및 불가항력적 사유 발생 시 제공이 제한되거나 일시 중지될 수 있습니다.</p>
                  </div>
                )}
              </div>

              <div className="terms-item">
                <div className="terms-item-header">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={privacyChecked}
                      onChange={(e) => setPrivacyChecked(e.target.checked)}
                    />
                    <span><strong>[필수]</strong> 개인정보 수집 및 이용 동의</span>
                  </label>
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setPrivacyOpen(!privacyOpen)}
                  >
                    {privacyOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </button>
                </div>

                {privacyOpen && (
                  <div className="terms-item-content">
                    <div className="privacy-summary-wrap">
                      <span className="privacy-sub-title">가. 필수 수집·이용목적 및 항목</span>
                      <table className="privacy-compact-table">
                        <thead>
                          <tr>
                            <th style={{ width: '30%' }}>목적</th>
                            <th style={{ width: '45%' }}>항목</th>
                            <th style={{ width: '25%' }}>보유기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>회원가입 및 계정 관리</td>
                            <td>성명, ID, 암호화된 비밀번호, 소속 회사·부서, 사용자 권한, 회사 코드</td>
                            <td>이용 종료 후 30일</td>
                          </tr>
                          <tr>
                            <td>서비스 안정성 및 부정 이용 방지</td>
                            <td>접속 로그, 접속 IP 정보, 서비스 이용 기록</td>
                            <td>이용 종료 후 30일</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="button full-width"
              disabled={!allChecked}
              onClick={handleNextStep}
            >
              동의하고 가입하기
            </button>
          </div>
        )}

        {/* STEP 2: 정보 입력 폼 */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="form">
            <input type="text" placeholder="이름을 입력해주세요" value={name} onChange={(event) => setName(event.target.value)} className="input" disabled={isLoading} />

            <div className="input-with-button" style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input type="text" placeholder="사용할 ID를 입력해주세요" value={userId} onChange={handleUserIdChange} className="input" style={{ flex: 1 }} disabled={isLoading} />
              <button type="button" onClick={handleCheckId} className="button" style={{ width: '100px', margin: 0, padding: '0 10px', fontSize: '13px', whiteSpace: 'nowrap' }} disabled={isLoading}>중복확인</button>
            </div>
            {idCheckMessage && <p className="message" style={{ color: isIdChecked ? '#2e7d32' : '#d32f2f' }}>{idCheckMessage}</p>}

            <div className="password-input-group">
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input"
                disabled={isLoading}
              />
              <p className="password-guide-text">
                * 영대/소문자, 숫자, 특수문자 중 3종류 이상 조합<br />
                (10자 이상)
              </p>
            </div>

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
        )}

        <div className="links" onClick={() => navigate('/login')}>이미 계정이 있으신가요? <span>로그인하기</span></div>
      </div>
    </div>
  )
}

export default SignupPage
