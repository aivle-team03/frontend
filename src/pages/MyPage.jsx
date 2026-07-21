import '../styles/MyPage.css'
import React, { useState, useEffect } from 'react';

function MyPage() {

  const [userInfo, setUserInfo] = useState({
    user_id: '',
    name: '',
    role: '',
    area: '지정 구역 없음',
    message: '설정된 알림이 없습니다.'
  });
  const [loading, setLoading] = useState(true);

  // 모달 및 비밀번호 변경 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('유저 정보를 불러오지 못했습니다.');
        }

        const data = await response.json();

        setUserInfo({
          user_id: data.user_id || '',
          name: data.name || '관리자',
          role: data.role || '산업안전 관리자',
          area: data.area || '지정 구역 없음',
          message: data.message || '설정된 알림이 없습니다.'
        });
      } catch (error) {
        console.error('마이페이지 연동 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyInfo();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalMessage('');
    setIsError(false);

    // 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsError(true);
      setModalMessage('모든 비밀번호 항목을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setModalMessage('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setModalMessage('비밀번호가 성공적으로 변경되었습니다!');
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setIsError(true);
        setModalMessage(data.detail || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      setIsError(true);
      setModalMessage('서버 통신 중 에러가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setModalMessage('');
    setIsError(false);
  };

  if (loading) return <div className="my-page-container">로딩 중...</div>;

  return (
    <section className="my-page-container" aria-label="마이페이지">
      <article className="my-page-card my-info">
        <span className="my-page-label">내 정보</span>
        <h2>{userInfo.name}</h2>
        <h2>{userInfo.role}</h2>
        <p>산업안전 관리 플랫폼 운영 계정</p>
      </article>

      <article className="my-page-card my-section">
        <span className="my-page-label">담당구역</span>
        <strong>{userInfo.area}</strong>
      </article>

      <article className="my-page-card alert-setting">
        <span className="my-page-label">알림 설정</span>
        <p>{userInfo.message}</p>
      </article>

      <article className="my-page-card my-info-change">
        <span className="my-page-label">내 정보 변경</span>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          계정 비밀번호를 안전하게 변경할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}
        >
          비밀번호 변경
        </button>
      </article>

      <article className="my-page-card recent-work-logs">
        <span className="my-page-label">최근 작업 로그</span>

        {/* {myLogs.map((log) => (
          <div key={log.id}>
            <strong>{log.action}</strong>
            <p>{log.detail}</p>
            <small>{log.time}</small>
          </div>
        ))} */}
      </article>
      {isModalOpen && (
        <div
          className="approval-modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <section
            className="mypage-password-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-v2-header">
              <h2>비밀번호 변경</h2>
              <button type="button" className="modal-v2-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="mypage-modal-body">
              <div className="input-group">
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  placeholder="현재 비밀번호를 입력하세요"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group">
                <label>새 비밀번호</label>
                <input
                  type="password"
                  placeholder="새 비밀번호 (4자리 이상)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group">
                <label>새 비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="새 비밀번호 다시 입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {modalMessage && (
                <p className={`modal-msg ${isError ? 'error' : 'success'}`}>
                  {modalMessage}
                </p>
              )}

              <div className="modal-v2-footer">
                <button type="button" className="btn-v2-list" onClick={closeModal} disabled={isSubmitting}>
                  취소
                </button>
                <button type="submit" className="btn-v2-approve" disabled={isSubmitting}>
                  {isSubmitting ? '수정 중...' : '변경'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default MyPage
