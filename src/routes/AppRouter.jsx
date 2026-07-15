import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import ActionHistoryPage from '../pages/ActionHistoryPage.jsx'
import ChecklistPage from '../pages/ChecklistPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import LawQaPage from '../pages/LawQaPage.jsx'
import MonitoringPage from '../pages/MonitoringPage.jsx'
import MyPage from '../pages/MyPage.jsx'
import React, { useState, useEffect } from 'react';
import LoginPage from '../pages/LoginPage.jsx'
import SignupPage from '../pages/SignupPage.jsx'

function AppRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const status = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(status);
    setIsLoading(false);
  }, []);

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {isLoggedIn ? (
          <Route element={<MainLayout setIsLoggedIn={setIsLoggedIn} />}>
            <Route index element={<HomePage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="checklists" element={<ChecklistPage />} />
            <Route path="actions" element={<ActionHistoryPage />} />
            <Route path="law-qa" element={<LawQaPage />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        ) : (
          <>
            <Route path="*" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate replace to="/login" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
