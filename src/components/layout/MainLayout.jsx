import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

const navigationItems = [
  { path: '/', label: '홈', icon: 'home' },
  { path: '/monitoring', label: 'CCTV 모니터링', icon: 'camera' },
  { path: '/checklists', label: '체크리스트', icon: 'checklist' },
  {
    label: '조치 이력', icon: 'history',
    children: [
      { path: '/actions', label: '조치 이력 관리', icon: 'history' },
      { path: '/risk-management', label: '위험도 관리', icon: 'risk' },
    ],
  },
  { path: '/law-qa', label: '법규 Q&A', icon: 'help' },
  {
    label: '안전 교육', icon: 'education',
    // TODO(auth): Replace this role flag with the authenticated user's permission set from the backend.
    children: [
      { path: '/education', label: '교육 이수', icon: 'education' },
      { path: '/education-management', label: '교육 관리', icon: 'manage', requiresRole: 'safety-manager' },
    ],
  },
  { path: '/board', label: '위험 신고 게시판', icon: 'board' },
  {
    path: '/report',
    label: '보고서',
    icon: 'report',
    children: [
      { path: '/report/create', label: '보고서 생성', icon: 'manage' },
      { path: '/report/list', label: '보고서 목록', icon: 'report' },
    ],
  },
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
      </div>
    </div>
  )
}

export default MainLayout
