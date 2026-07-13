import { useState } from 'react'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

const navigationItems = [
  { id: 'home', label: '\uD648', icon: 'home' },
  { id: 'cctv', label: 'CCTV \uBAA8\uB2C8\uD130\uB9C1', icon: 'camera' },
  { id: 'checklist', label: '\uCCB4\uD06C\uB9AC\uC2A4\uD2B8', icon: 'checklist' },
  { id: 'actions', label: '\uC870\uCE58 \uC774\uB825', icon: 'history' },
  { id: 'chatbot', label: '\uBC95\uADDC Q&A', icon: 'help' },
]

function MainLayout({ children, setIsLoggedIn, activeItemId, setActiveItemId }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const activeItem =
    navigationItems.find((item) => item.id === activeItemId) ?? navigationItems[0]

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <Sidebar
        activeItemId={activeItemId}
        isCollapsed={isSidebarCollapsed}
        items={navigationItems}
        onSelect={setActiveItemId} // 사이드바 클릭 시 App.jsx의 상태가 바뀝니다.
        onToggle={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
      />
      <div className="app-content">
        {/* Header에 setIsLoggedIn을 프롭 드릴링으로 전달합니다 */}
        <Header title={activeItem.label} setIsLoggedIn={setIsLoggedIn} />
        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
