import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function LoginPage({ setIsLoggedIn }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetName, setResetName] = useState('');
  const [resetNewPw, setResetNewPw] = useState('');
  const [resetConfirmPw, setResetConfirmPw] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isModalError, setIsModalError] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
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
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isLoggedIn', 'true');

        setIsLoggedIn(true);
      } else {
        setErrorMessage(data.detail || 'ID 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      setErrorMessage('서버와 통신할 수 없습니다. FastAPI 서버가 켜져 있는지 확인하세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setModalMessage('');
    setIsModalError(false);

    if (!resetUserId.trim() || !resetName.trim() || !resetNewPw.trim() || !resetConfirmPw.trim()) {
      setIsModalError(true);
      setModalMessage('모든 필드를 입력해주세요.');
      return;
    }

    if (resetNewPw !== resetConfirmPw) {
      setIsModalError(true);
      setModalMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsResetLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/find/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: resetUserId,
          name: resetName,
          new_password: resetNewPw
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalError(false);
        setModalMessage('비밀번호가 성공적으로 변경되었습니다! 로그인 해주세요.');
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setIsModalError(true);
        setModalMessage(data.detail || '일치하는 사용자 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      setIsModalError(true);
      setModalMessage('서버와 통신 중 에러가 발생했습니다.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setResetUserId('');
    setResetName('');
    setResetNewPw('');
    setResetConfirmPw('');
    setModalMessage('');
    setIsModalError(false);
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
          <span onClick={() => navigate('/signup')}>회원가입</span> | <span onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>비밀번호 찾기</span>
        </div>
      </div>
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '8px',
            width: '360px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#333' }}>비밀번호 재설정</h3>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="가입한 ID"
                value={resetUserId}
                onChange={(e) => setResetUserId(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={isResetLoading}
              />
              <input
                type="text"
                placeholder="가입자 이름"
                value={resetName}
                onChange={(e) => setResetName(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={isResetLoading}
              />
              <input
                type="password"
                placeholder="새로운 비밀번호"
                value={resetNewPw}
                onChange={(e) => setResetNewPw(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={isResetLoading}
              />
              <input
                type="password"
                placeholder="새로운 비밀번호 확인"
                value={resetConfirmPw}
                onChange={(e) => setResetConfirmPw(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={isResetLoading}
              />

              {modalMessage && (
                <p style={{ fontSize: '12px', color: isModalError ? '#d32f2f' : '#2e7d32', margin: '4px 0 0 0' }}>
                  {modalMessage}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  style={{
                    flex: 1, padding: '10px', backgroundColor: '#1976d2', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {isResetLoading ? '변경 중...' : '비밀번호 변경'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isResetLoading}
                  style={{
                    flex: 1, padding: '10px', backgroundColor: '#e0e0e0', color: '#333',
                    border: 'none', borderRadius: '4px', cursor: 'pointer'
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;