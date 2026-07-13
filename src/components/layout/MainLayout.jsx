import { useState } from 'react'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import MyPage from '../../pages/MyPage.jsx'
import HomePage from '../../pages/HomePage.jsx'

const navigationItems = [
  { id: 'home', label: '\uD648', icon: 'home' },
  { id: 'cctv', label: 'CCTV \uBAA8\uB2C8\uD130\uB9C1', icon: 'camera' },
  { id: 'checklist', label: '\uCCB4\uD06C\uB9AC\uC2A4\uD2B8', icon: 'checklist' },
  { id: 'actions', label: '\uC870\uCE58 \uC774\uB825', icon: 'history' },
  { id: 'law', label: '\uBC95\uADDC Q&A', icon: 'help' },
]

function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeItemId, setActiveItemId] = useState('home')
  const activeItem =
    navigationItems.find((item) => item.id === activeItemId) ?? navigationItems[0]

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <Sidebar
        activeItemId={activeItemId}
        isCollapsed={isSidebarCollapsed}
        items={navigationItems}
        onSelect={setActiveItemId}
        onToggle={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
      />
      <div className="app-content">
        <Header title={activeItem.label}
        onSelect = {setActiveItemId} />
        <main className="app-main">
          {activeItemId === 'home' && <HomePage />}
          {activeItemId === 'mypage' && <MyPage />}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
