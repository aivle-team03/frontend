import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function LoginPage({ setIsLoggedIn }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 1. FastAPI의 실제 로그인 엔드포인트 주소로 변경 (/api/auth/login)
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: id,
          password: pw
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. 로그인 성공 시 백엔드가 주는 'user_info' 구조에 맞춰 세션 저장
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isLoggedIn', 'true');
        // localStorage.setItem('userName', data.user_info.name);
        // localStorage.setItem('userRole', data.user_info.role);
        // localStorage.setItem('userUid', data.user_info.uid); // DB 고유 PK 값
        // localStorage.setItem('companyCode', data.user_info.company_code); // 회사 코드

        setIsLoggedIn(true);
      } else {
        // 3. 백엔드에서 raise HTTPException 한 에러 메시지 처리 (예: "비밀번호가 틀렸습니다.")
        setErrorMessage(data.detail || 'ID 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      setErrorMessage('서버와 통신할 수 없습니다. FastAPI 서버가 켜져 있는지 확인하세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="logo-area">
        <h2 className="sub-title">AI 소방안전관리 비서</h2>
        <p className="desc">Intelligent Fire Safety Management Assistant</p>
      </div>

      <div className="login-box">
        <h3 className="main-title">시설안전 관리 자동화 AI 시스템</h3>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="ID를 입력해주세요"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="input"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="PW를 입력해주세요"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="input"
            disabled={isLoading}
          />

          {errorMessage && <p className="error">{errorMessage}</p>}

          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="links">
          <span onClick={() => navigate('/signup')}>회원가입</span> | <span>비밀번호 찾기</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;