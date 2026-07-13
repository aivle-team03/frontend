import React from 'react';

function Header({ title, setIsLoggedIn }) {
  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // 로컬스토리지 비우기
    setIsLoggedIn(false); // App.jsx의 상태를 false로 바꿔서 로그인 페이지로 이동
  };

  return (
    <header className="app-header">
      <h1>{title}</h1>
      <button onClick={handleLogout} style={{ marginLeft: 'auto', padding: '5px 10px', cursor: 'pointer' }}>
        로그아웃
      </button>
    </header>
  );
}

export default Header
