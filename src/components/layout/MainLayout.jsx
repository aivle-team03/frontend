import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import MyPage from '../../pages/MyPage.jsx'
import HomePage from '../../pages/HomePage.jsx'

const navigationItems = [
  { path: '/', label: '홈', icon: 'home' },
  { path: '/monitoring', label: 'CCTV 모니터링', icon: 'camera' },
  { path: '/checklists', label: '체크리스트', icon: 'checklist' },
  { path: '/actions', label: '조치 이력', icon: 'history' },
  { path: '/law-qa', label: '법규 Q&A', icon: 'help' },
]

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        items={navigationItems}
        onToggle={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
      />
      <div className="app-content">
        <Header items={navigationItems} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
