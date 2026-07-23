import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function LoginPage({ setIsLoggedIn }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 비밀번호 재설정 모달 상태
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
      setErrorMessage('서버와 통신할 수 없습니다. FastAPI 서버 상태를 확인해주세요.');
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
          <span onClick={() => navigate('/signup')}>회원가입</span> |{' '}
          <span onClick={() => setIsModalOpen(true)} className="find-pw-link">
            비밀번호 찾기
          </span>
        </div>
      </div>

      {isModalOpen &&
        ReactDOM.createPortal(
          <div
            className="approval-modal-backdrop"
            role="presentation"
            onMouseDown={closeModal}
          >
            <section
              className="login-password-modal"
              role="dialog"
              aria-modal="true"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="modal-v2-header">
                <h2>비밀번호 재설정</h2>
                <button type="button" className="modal-v2-close" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="login-modal-body">
                <div className="input-group">
                  <label>가입 ID</label>
                  <input
                    type="text"
                    placeholder="가입한 ID"
                    value={resetUserId}
                    onChange={(e) => setResetUserId(e.target.value)}
                    disabled={isResetLoading}
                  />
                </div>

                <div className="input-group">
                  <label>가입자 이름</label>
                  <input
                    type="text"
                    placeholder="가입자 이름"
                    value={resetName}
                    onChange={(e) => setResetName(e.target.value)}
                    disabled={isResetLoading}
                  />
                </div>

                <div className="input-group">
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    placeholder="새로운 비밀번호"
                    value={resetNewPw}
                    onChange={(e) => setResetNewPw(e.target.value)}
                    disabled={isResetLoading}
                  />
                </div>

                <div className="input-group">
                  <label>새 비밀번호 확인</label>
                  <input
                    type="password"
                    placeholder="새로운 비밀번호 확인"
                    value={resetConfirmPw}
                    onChange={(e) => setResetConfirmPw(e.target.value)}
                    disabled={isResetLoading}
                  />
                </div>

                {modalMessage && (
                  <p className={`modal-msg ${isModalError ? 'error' : 'success'}`}>
                    {modalMessage}
                  </p>
                )}

                <div className="modal-v2-footer">
                  <button
                    type="button"
                    className="btn-v2-list"
                    onClick={closeModal}
                    disabled={isResetLoading}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn-v2-approve"
                    disabled={isResetLoading}
                  >
                    {isResetLoading ? '변경 중...' : '비밀번호 변경'}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}

export default LoginPage;