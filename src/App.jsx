import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx'; // 새로 만들 로그인 페이지 임포트
import ChecklistPage from './pages/ChecklistPage.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeItemId, setActiveItemId] = useState('home');

  // 1. 브라우저가 새로고침되어도 로그인 상태가 유지되도록 로컬스토리지 확인
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
  }, []);

  const renderContent = () => {
    switch (activeItemId) {
      case 'home':
        return <HomePage />;
      case 'checklist':
        return <ChecklistPage />; // 체크리스트 클릭 시 변환
      // cctv, actions, law 페이지 컴포넌트도 완성되는 대로 여기에 추가하면 됩니다.
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      {isLoggedIn ? (
        // MainLayout이 필요로 하는 라우팅 상태 및 제어 함수를 주입합니다.
        <MainLayout
          setIsLoggedIn={setIsLoggedIn}
          activeItemId={activeItemId}
          setActiveItemId={setActiveItemId}
        >
          {renderContent()}
        </MainLayout>
      ) : (
        <LoginPage setIsLoggedIn={setIsLoggedIn} />
      )}
    </>
  );
}

export default App;