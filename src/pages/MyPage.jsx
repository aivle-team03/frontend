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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 🚀 2. 백엔드 /api/auth/me로 내 정보 요청 함수
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

        // 🚀 3. 백엔드에서 받아온 데이터로 state 업데이트
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

    // 간단한 프론트엔드 유효성 검사
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
        setIsError(false);
        setModalMessage('비밀번호가 성공적으로 변경되었습니다!');
        // 1.5초 후 모달 닫기 및 폼 초기화
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
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '8px',
            width: '360px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>비밀번호 변경</h3>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={isSubmitting}
              />
              <input
                type="password"
                placeholder="새 비밀번호 (4자리 이상)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={isSubmitting}
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={isSubmitting}
              />

              {modalMessage && (
                <p style={{ fontSize: '12px', color: isError ? 'red' : 'green', margin: '4px 0 0 0' }}>
                  {modalMessage}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1, padding: '10px', backgroundColor: '#1976d2', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  {isSubmitting ? '수정 중...' : '변경'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
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
    </section>
  )
}

export default MyPage
