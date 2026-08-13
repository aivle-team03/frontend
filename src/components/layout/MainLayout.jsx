import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import ServiceFooter from '../common/ServiceFooter.jsx'

const navigationItems = [
  { path: '/', label: '홈', icon: 'home' },
  { path: '/monitoring', label: 'CCTV 모니터링', icon: 'camera' },
  {
    label: '체크리스트', icon: 'checklist',
    children: [
      { path: '/checklists', label: '오늘의 할일', icon: 'checklist' },
      { path: '/checklists/management', label: '담당자 배정', icon: 'manage', requiresRole: 'safety-manager' },
      { path: '/checklists/inspections', label: '정기 점검 목록', icon: 'checklist', requiresRole: 'safety-manager' },
    ],
  },
  {
    label: '이력 관리', icon: 'history',
    children: [
      { path: '/actions', label: '점검/조치 이력 관리', icon: 'history' },
      { path: '/risk-management', label: '위험도 관리', icon: 'risk' },
    ],
  },
  {
    label: '안전 교육', icon: 'education',
    // TODO(auth): Replace this role flag with the authenticated user's permission set from the backend.
    children: [
      { path: '/education', label: '교육 이수', icon: 'education' },
      { path: '/education-management', label: '교육 관리', icon: 'manage', requiresRole: 'safety-manager' },
    ],
  },
  { path: '/report', label: '보고서', icon: 'report' },
  { path: '/board', label: '위험 신고 게시판', icon: 'board' },
  { path: '/law-qa', label: 'AI 비서', icon: 'help' },
]

function MainLayout({ setIsLoggedIn }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  // Temporary frontend role: safety manager. Backend authorization will own access control later.
  const currentUserRole = 'safety-manager'

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        items={navigationItems}
        currentUserRole={currentUserRole}
        onToggle={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
      />
      <div className="app-content">
        <Header items={navigationItems} setIsLoggedIn={setIsLoggedIn} />
        <main className="app-main">
          <Outlet />
        </main>
        <ServiceFooter />
      </div>
    </div>
  )
}

export default MainLayout
