import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import ActionHistoryPage from '../pages/ActionHistoryPage.jsx'
import ChecklistPage from '../pages/ChecklistPage.jsx'
import ChecklistManagementPage from '../pages/ChecklistManagementPage.jsx'
import EducationPage from '../pages/EducationPage.jsx'
import EducationManagementPage from '../pages/EducationManagementPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import LawQaPage from '../pages/LawQaPage.jsx'
import MonitoringPage from '../pages/MonitoringPage.jsx'
import MyPage from '../pages/MyPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import SignupPage from '../pages/SignupPage.jsx'
import MonitoringDetailPage from '../pages/MonitoringDetailPage.jsx'
import BoardPage from '../pages/BoardPage.jsx'
import ReportCreatePage from '../pages/ReportCreatePage.jsx'
import ReportListPage from '../pages/ReportListPage.jsx'
import ReportPage from '../pages/ReportPage.jsx'
import RiskManagementPage from '../pages/RiskManagementPage.jsx'

function AppRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addedCourses, setAddedCourses] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';

    if (token && loggedInStatus) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
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
            <Route path="checklists/management" element={<ChecklistManagementPage />} />
            <Route path="actions" element={<ActionHistoryPage />} />
            <Route path="law-qa" element={<LawQaPage />} />
            <Route path="education" element={<EducationPage addedCourses={addedCourses} />} />
            <Route path="board" element={<BoardPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="report/create" element={<ReportCreatePage />} />
            <Route path="report/list" element={<ReportListPage />} />
            <Route
              path="education-management"
              element={
                <EducationManagementPage
                  addedCourses={addedCourses}
                  onAddCourse={(course) => setAddedCourses((current) => [course, ...current])}
                />
              }
            />
            <Route path="risk-management" element={<RiskManagementPage />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="monitoringdetail" element={<MonitoringDetailPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        ) : (
          <>
            <Route path="login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate replace to="/login" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
