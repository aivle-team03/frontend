import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { BACKEND_API_URL } from '../config/api.js'
import { setUiLanguage, useUiLanguage } from '../utils/uiLanguage.js'
import '../styles/Signup.css'

const API_BASE_URL = `${BACKEND_API_URL}/api`

const COPY = {
  ko: {
    brand: 'BOSS : 안전관리 서비스', subtitle: 'Industrial Fire Safety Management Service',
    agreement: '서비스 이용 동의', agreementGuide: '안전한 서비스 이용을 위해 필수 항목을 확인해주세요.', signup: '시스템 회원가입', signupGuide: '업무 계정 생성을 위한 정보를 입력해주세요.',
    requiredTerms: '[필수] BOSS 이용약관 동의', requiredPrivacy: '[필수] 개인정보 수집 및 이용 동의', next: '동의하고 계속하기',
    name: '이름', namePlaceholder: '이름을 입력하세요', id: '사용자 ID', idPlaceholder: '사용할 ID를 입력하세요', checkId: '중복 확인',
    password: '비밀번호', passwordPlaceholder: '비밀번호를 입력하세요', passwordGuide: '영문 대·소문자, 숫자, 특수문자 중 3종류 이상을 조합해 10자 이상 입력해주세요.',
    code: '회사 코드', codePlaceholder: '회사 코드를 입력하세요', checkCode: '코드 확인', complete: '회원가입 완료', processing: '처리 중...',
    account: '이미 계정이 있으신가요?', login: '로그인하기', show: '비밀번호 표시', hide: '비밀번호 숨기기',
    consentRequired: '필수 약관에 모두 동의해주세요.', enterId: '아이디를 입력해주세요.', idAvailable: '사용 가능한 아이디입니다.', idTaken: '이미 존재하는 아이디입니다.', idError: '중복 확인 중 오류가 발생했습니다.',
    enterCode: '회사 코드를 입력해주세요.', invalidCode: '유효하지 않은 회사 코드입니다.', codeAvailable: '사용 가능한 회사 코드입니다.', codeError: '회사 코드 확인 중 오류가 발생했습니다.',
    fillAll: '모든 필드를 입력해주세요.', checkIdFirst: '아이디 중복 확인을 해주세요.', checkCodeFirst: '회사 코드 확인을 해주세요.', signupFail: '회원가입에 실패했습니다.', signupDone: '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.', server: '서버와 통신할 수 없습니다.',
    roleCategory: (role, category) => category ? `${role} · ${category} 카테고리로 가입됩니다.` : `${role} 계정으로 가입됩니다.`,
  },
  en: {
    brand: 'BOSS : Safety Management Service', subtitle: 'Industrial Fire and Workplace Safety Platform',
    agreement: 'Service agreement', agreementGuide: 'Review the required items before creating your secure account.', signup: 'Create your account', signupGuide: 'Enter the information required for your workplace account.',
    requiredTerms: '[Required] Agree to the BOSS Terms of Service', requiredPrivacy: '[Required] Agree to the collection and use of personal information', next: 'Agree and continue',
    name: 'Name', namePlaceholder: 'Enter your name', id: 'User ID', idPlaceholder: 'Choose a user ID', checkId: 'Check availability',
    password: 'Password', passwordPlaceholder: 'Create a password', passwordGuide: 'Use at least 10 characters and combine three or more of uppercase letters, lowercase letters, numbers, and special characters.',
    code: 'Company code', codePlaceholder: 'Enter your company code', checkCode: 'Verify code', complete: 'Create account', processing: 'Creating account...',
    account: 'Already have an account?', login: 'Sign in', show: 'Show password', hide: 'Hide password',
    consentRequired: 'Please agree to all required items.', enterId: 'Enter a user ID.', idAvailable: 'This user ID is available.', idTaken: 'This user ID is already in use.', idError: 'Unable to check the user ID.',
    enterCode: 'Enter your company code.', invalidCode: 'This company code is not valid.', codeAvailable: 'The company code has been verified.', codeError: 'Unable to verify the company code.',
    fillAll: 'Please complete every field.', checkIdFirst: 'Check the availability of your user ID.', checkCodeFirst: 'Verify your company code.', signupFail: 'Unable to create your account.', signupDone: 'Your account has been created. Redirecting to sign in.', server: 'Unable to connect to the server.',
    roleCategory: (role, category) => category ? `Your account will be created as ${role} · ${category}.` : `Your account will be created as ${role}.`,
  },
}

const TERMS = {
  ko: [
    ['제1조 (목적)', '본 약관은 주식회사 BOSS(이하 “회사”)가 제공하는 시설안전 관리 플랫폼 BOSS 서비스(이하 “서비스”)를 이용함에 있어 회사와 회원의 권리, 의무, 이용조건 및 절차를 규정함을 목적으로 합니다.'],
    ['제2조 (약관의 효력 및 변경)', '본 약관은 회원의 동의로 효력이 발생합니다. 회사는 관계 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 내용은 적용일 7일 전(회원에게 불리한 경우 30일 전) 공지합니다.'],
    ['제3조 (약관 외 준칙)', '본 약관에서 정하지 않은 사항은 관계 법령과 회사의 개별 운영정책을 따릅니다.'],
    ['제4조 (용어의 정의)', '“서비스”란 CCTV 모니터링, 담당자 배정, 조치이력, 위험도 관리, AI 비서 등 시설안전 관리를 위한 플랫폼을 말합니다. “회원”은 약관에 동의하고 계정을 발급받은 사람이며, “회사 코드”는 소속 사업장을 식별하는 승인 코드입니다.'],
    ['제5조 (이용계약의 체결)', '회원이 신청 양식에 필수 정보를 기재하고 가입을 신청한 뒤 회사가 이를 승인하면 이용계약이 체결됩니다.'],
    ['제6조 (이용신청의 제한)', '타인의 명의 사용, 허위 정보 기재, 미승인 회사 코드 사용, 시스템 악용이 확인되면 가입 승인이 제한되거나 이용계약이 해지될 수 있습니다.'],
    ['제7조 (회원정보의 변경 및 보호)', '회원은 개인정보를 최신 상태로 유지해야 하며 ID는 변경할 수 없습니다. 정보 미변경으로 발생한 불이익은 회원에게 책임이 있습니다.'],
    ['제8조 (서비스 제공)', '서비스는 연중무휴 제공을 원칙으로 하지만 점검, 장애 또는 불가피한 사유가 발생하면 일시적으로 제한되거나 중단될 수 있습니다.'],
  ],
  en: [
    ['Article 1 (Purpose)', 'These Terms govern the rights, obligations, conditions of use, and procedures between BOSS Co., Ltd. (the “Company”) and users of the BOSS facility safety management platform (the “Service”).'],
    ['Article 2 (Effect and Amendment)', 'These Terms become effective when a member agrees to them. The Company may amend them within applicable law and will announce changes at least 7 days before they take effect, or 30 days before if a change is unfavorable to members.'],
    ['Article 3 (Additional Rules)', 'Matters not covered by these Terms are governed by applicable law and the Company’s individual operating policies.'],
    ['Article 4 (Definitions)', '“Service” means the platform for facility safety management, including CCTV monitoring, manager assignment, action history, risk management, and the AI assistant. “Member” means a person issued an account after accepting these Terms. “Company code” means an authorization code identifying a workplace.'],
    ['Article 5 (Service Agreement)', 'A service agreement is formed when an applicant submits the required information and the Company approves the account request.'],
    ['Article 6 (Restrictions)', 'The Company may reject or terminate an account involving another person’s identity, false information, an unauthorized company code, or misuse of the system.'],
    ['Article 7 (Account Information)', 'Members must keep their personal information current. A user ID cannot be changed, and members are responsible for disadvantages caused by outdated information.'],
    ['Article 8 (Service Availability)', 'The Service is intended to operate year-round, but access may be temporarily restricted or suspended because of maintenance, failures, or other unavoidable circumstances.'],
  ],
}

const PRIVACY = {
  ko: { heading: '필수 수집·이용 목적 및 항목', columns: ['목적', '수집 항목', '보유 기간'], rows: [['회원가입 및 계정 관리', '이름, ID, 암호화된 비밀번호, 소속 회사·부서, 사용자 권한, 회사 코드', '이용 종료 후 30일'], ['서비스 안정성 및 부정 이용 방지', '접속 로그, 접속 IP 정보, 서비스 이용 기록', '이용 종료 후 30일']], note: '필수 정보 수집에 동의하지 않을 수 있으나, 동의하지 않으면 회원가입 및 서비스 이용이 제한됩니다.' },
  en: { heading: 'Required purposes and data collected', columns: ['Purpose', 'Personal data collected', 'Retention period'], rows: [['Account registration and management', 'Name, user ID, encrypted password, company and department, user permissions, and company code', '30 days after service termination'], ['Service security and prevention of misuse', 'Access logs, IP address, and service usage records', '30 days after service termination']], note: 'You may decline this required collection, but account registration and use of the Service will then be unavailable.' },
}

function LanguageSwitch({ language }) {
  return <div className="auth-language" role="group" aria-label="Language"><button type="button" className={language === 'ko' ? 'is-active' : ''} onClick={() => setUiLanguage('ko')}>한국어</button><button type="button" className={language === 'en' ? 'is-active' : ''} onClick={() => setUiLanguage('en')}>EN</button></div>
}

function SignupPage() {
  const { language } = useUiLanguage()
  const copy = COPY[language]
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(true)
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [name, setName] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [verifiedCode, setVerifiedCode] = useState(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [idCheckMessage, setIdCheckMessage] = useState('')
  const [codeCheckMessage, setCodeCheckMessage] = useState('')
  const allChecked = termsChecked && privacyChecked

  const handleNextStep = () => {
    if (!allChecked) return alert(copy.consentRequired)
    setStep(2)
  }
  const handleUserIdChange = (event) => { setUserId(event.target.value); setIsIdChecked(false); setIdCheckMessage('') }
  const handleSignupCodeChange = (event) => { setSignupCode(event.target.value); setVerifiedCode(null); setCodeCheckMessage('') }

  const handleCheckId = async () => {
    if (!userId.trim()) return setIdCheckMessage(copy.enterId)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/checkid?user_id=${encodeURIComponent(userId.trim())}`)
      const data = await response.json()
      const available = data.message === 'available'
      setIsIdChecked(available)
      setIdCheckMessage(available ? copy.idAvailable : copy.idTaken)
    } catch { setIsIdChecked(false); setIdCheckMessage(copy.idError) }
  }

  const handleVerifyCode = async () => {
    if (!signupCode.trim()) { setVerifiedCode(null); return setCodeCheckMessage(copy.enterCode) }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-code?code=${encodeURIComponent(signupCode.trim())}`)
      const data = await response.json()
      if (!response.ok) throw new Error(language === 'en' ? copy.invalidCode : (data.detail || copy.invalidCode))
      setVerifiedCode(data); setCodeCheckMessage(copy.codeAvailable)
    } catch (error) { setVerifiedCode(null); setCodeCheckMessage(error.message || copy.codeError) }
  }

  const handleSubmit = async (event) => {
    event.preventDefault(); setMessage(''); setIsError(false)
    if (!userId.trim() || !password.trim() || !name.trim() || !signupCode.trim()) { setIsError(true); return setMessage(copy.fillAll) }
    if (!isIdChecked) { setIsError(true); return setMessage(copy.checkIdFirst) }
    if (!verifiedCode || verifiedCode.code !== signupCode.trim()) { setIsError(true); return setMessage(copy.checkCodeFirst) }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId.trim(), password, name: name.trim(), code: verifiedCode.code, company_id: verifiedCode.company_id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(language === 'en' ? copy.signupFail : (data.detail || copy.signupFail))
      setMessage(copy.signupDone)
      window.setTimeout(() => navigate('/login'), 1500)
    } catch (error) { setIsError(true); setMessage(error.message || copy.server) } finally { setIsLoading(false) }
  }

  const field = (label, value, onChange, placeholder, Icon) => <label className="auth-field"><span>{label}</span><span className="auth-input-wrap"><Icon /><input value={value} onChange={onChange} placeholder={placeholder} disabled={isLoading} /></span></label>

  return <main className="auth-page signup-page">
    <div className="auth-glow auth-glow-one" />
    <div className="auth-glow auth-glow-two" />
    <LanguageSwitch language={language} />
    <section className="auth-shell signup-shell">
      <header className="auth-brand">
        <div><h1>{copy.brand}</h1><p>{copy.subtitle}</p></div>
      </header>
      <article className="auth-card signup-card">
        <div className="auth-card-heading">
          <span>{step === 1 ? 'SECURE ONBOARDING · 01' : 'SECURE ONBOARDING · 02'}</span>
          <h2>{step === 1 ? copy.agreement : copy.signup}</h2>
          <p>{step === 1 ? copy.agreementGuide : copy.signupGuide}</p>
          <div className="signup-progress"><i className="is-active" /><i className={step === 2 ? 'is-active' : ''} /></div>
        </div>

        {step === 1 ? <div className="signup-terms">
          <div className="terms-item">
            <div className="terms-item-header"><label><input type="checkbox" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)} /><span>{copy.requiredTerms}</span></label><button type="button" onClick={() => setTermsOpen(!termsOpen)} aria-label="Toggle terms">{termsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</button></div>
            {termsOpen && <div className="terms-item-content">{TERMS[language].map(([title, body]) => <section key={title}><strong>{title}</strong><p>{body}</p></section>)}</div>}
          </div>
          <div className="terms-item">
            <div className="terms-item-header"><label><input type="checkbox" checked={privacyChecked} onChange={e => setPrivacyChecked(e.target.checked)} /><span>{copy.requiredPrivacy}</span></label><button type="button" onClick={() => setPrivacyOpen(!privacyOpen)} aria-label="Toggle privacy">{privacyOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</button></div>
            {privacyOpen && <div className="terms-item-content"><strong>{PRIVACY[language].heading}</strong><table className="privacy-compact-table"><thead><tr>{PRIVACY[language].columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{PRIVACY[language].rows.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table><p>{PRIVACY[language].note}</p></div>}
          </div>
          <button type="button" className="auth-primary" disabled={!allChecked} onClick={handleNextStep}>{copy.next}</button>
        </div> : <form className="auth-form signup-form" onSubmit={handleSubmit}>
          {field(copy.name, name, e => setName(e.target.value), copy.namePlaceholder, BadgeOutlinedIcon)}
          <div className="signup-action-row">{field(copy.id, userId, handleUserIdChange, copy.idPlaceholder, PersonOutlineRoundedIcon)}<button type="button" className="auth-secondary signup-check-button" onClick={handleCheckId} disabled={isLoading}>{copy.checkId}</button></div>
          {idCheckMessage && <p className={`auth-message ${isIdChecked ? 'is-success' : 'is-error'}`}>{idCheckMessage}</p>}
          <label className="auth-field"><span>{copy.password}</span><span className="auth-input-wrap"><LockOutlinedIcon /><input type={passwordVisible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={copy.passwordPlaceholder} disabled={isLoading} autoComplete="new-password" /><button type="button" aria-label={passwordVisible ? copy.hide : copy.show} title={passwordVisible ? copy.hide : copy.show} onClick={() => setPasswordVisible(value => !value)}>{passwordVisible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</button></span><small className="signup-field-guide">{copy.passwordGuide}</small></label>
          <div className="signup-action-row">{field(copy.code, signupCode, handleSignupCodeChange, copy.codePlaceholder, BusinessOutlinedIcon)}<button type="button" className="auth-secondary signup-check-button" onClick={handleVerifyCode} disabled={isLoading}>{copy.checkCode}</button></div>
          {codeCheckMessage && <p className={`auth-message ${verifiedCode ? 'is-success' : 'is-error'}`}>{codeCheckMessage}</p>}
          {verifiedCode && <p className="signup-code-summary">{copy.roleCategory(verifiedCode.role, verifiedCode.category)}</p>}
          {message && <p className={`auth-message ${isError ? 'is-error' : 'is-success'}`}>{message}</p>}
          <button type="submit" className="auth-primary signup-submit-button" disabled={isLoading} onPointerEnter={event => { event.currentTarget.style.transform = 'translateY(-1px)' }} onPointerLeave={event => { event.currentTarget.style.transform = '' }}>{isLoading ? copy.processing : copy.complete}</button>
        </form>}
        <button type="button" className="signup-login-link" onClick={() => navigate('/login')}>{copy.account} <strong>{copy.login}</strong></button>
      </article>
    </section>
  </main>
}

export default SignupPage
