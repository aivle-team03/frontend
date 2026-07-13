import React, { useState } from 'react';

const MOCK_USER = {
  id: 'admin',
  pw: '1234'
};

function LoginPage({ setIsLoggedIn }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // 백엔드 대신 프론트 단에서 더미 데이터와 비교 검증
    if (id === MOCK_USER.id && pw === MOCK_USER.pw) {
      // 1. 브라우저에 로그인 토큰(가짜) 저장
      localStorage.setItem('isLoggedIn', 'true');

      // 2. 상위 컴포넌트의 상태를 true로 변경하여 화면 전환
      setIsLoggedIn(true);
    } else {
      setError('ID 또는 비밀번호가 일치하지 않습니다.'); // 요구사항 정의서 반영
    }
  };

  return (
    // 로그인 UI 마크업 (요구사항 정의서 1-1 번에 해당)[cite: 1]
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <input type="text" placeholder="ID를 입력해주세요" value={id} onChange={(e) => setId(e.target.value)} style={{ marginBottom: '10px' }} />
      <input type="password" placeholder="PW를 입력해주세요" value={pw} onChange={(e) => setPw(e.target.value)} style={{ marginBottom: '10px' }} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer' }}>
        로그인
      </button>
    </form>
  );
}

export default LoginPage;