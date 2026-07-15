import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import ActionHistoryPage from '../pages/ActionHistoryPage.jsx'
import ChecklistPage from '../pages/ChecklistPage.jsx'
import EducationPage from '../pages/EducationPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import LawQaPage from '../pages/LawQaPage.jsx'
import MonitoringPage from '../pages/MonitoringPage.jsx'
import MyPage from '../pages/MyPage.jsx'
import MonitoringDetailPage from '../pages/MonitoringDetailPage.jsx'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="checklists" element={<ChecklistPage />} />
          <Route path="actions" element={<ActionHistoryPage />} />
          <Route path="law-qa" element={<LawQaPage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="monitoringdetail" element={<MonitoringDetailPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
