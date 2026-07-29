import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import ActionHistoryPage from '../pages/ActionHistoryPage.jsx'
import ChecklistPage from '../pages/ChecklistPage.jsx'
import ChecklistManagementPage from '../pages/ChecklistManagementPage.jsx'
import InspectionListPage from '../pages/InspectionListPage.jsx'
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
import SafetyManagementPage from '../pages/SafetyManagementPage.jsx'

function AppRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    return Boolean(token && loggedInStatus)
  });
  const [addedCourses, setAddedCourses] = useState([])
  return (
    <BrowserRouter>
      <Routes>
        {isLoggedIn ? (
          <Route element={<MainLayout setIsLoggedIn={setIsLoggedIn} />}>
            <Route index element={<HomePage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="checklists" element={<ChecklistPage />} />
            <Route path="checklists/management" element={<ChecklistManagementPage />} />
            <Route path="/checklists/inspections" element={<InspectionListPage />} />
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
            <Route path="safety-management" element={<SafetyManagementPage />} />
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
