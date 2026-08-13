import { useState, useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import ServiceFooter from '../common/ServiceFooter.jsx'

const ROLE_DEFAULT_PATH = {
  '안전관리자': '/',
  '관제사': '/monitoring',
  '현장관리자': '/checklists',
  '일반유저': '/checklists',
}

const navigationItems = [
  { path: '/', label: '홈', icon: 'home', allowedRoles: ['안전관리자'] },
  { path: '/monitoring', label: 'CCTV 모니터링', icon: 'camera', allowedRoles: ['안전관리자', '관제사'] },
  {
    label: '체크리스트', icon: 'checklist',
    children: [
      { path: '/checklists', label: '오늘의 할일', icon: 'checklist', allowedRoles: ['안전관리자', '현장관리자', '일반유저'] },
      { path: '/checklists/management', label: '담당자 배정', icon: 'manage', allowedRoles: ['안전관리자'] },
      { path: '/checklists/inspections', label: '정기 점검 목록', icon: 'checklist', allowedRoles: ['안전관리자'] },
    ],
  },
  {
    label: '이력 관리', icon: 'history',
    children: [
      { path: '/actions', label: '점검/조치 이력 관리', icon: 'history', allowedRoles: ['안전관리자'] },
      { path: '/risk-management', label: '위험도 관리', icon: 'risk', allowedRoles: ['안전관리자'] },
    ],
  },
  {
    label: '안전 교육', icon: 'education',
    children: [
      { path: '/education', label: '교육 이수', icon: 'education' },
      { path: '/education-management', label: '교육 관리', icon: 'manage', allowedRoles: ['안전관리자'] },
    ],
  },
  { path: '/report', label: '보고서', icon: 'report', allowedRoles: ['안전관리자'] },
  { path: '/board', label: '위험 신고 게시판', icon: 'board' },
  { path: '/law-qa', label: 'AI 비서', icon: 'help' },
]

function filterNavItemsByRole(items, userRole) {
  if (!userRole) {
    return items.filter((item) => !item.allowedRoles && !item.requiresRole)
  }

  const normalizedUserRole = String(userRole).toLowerCase().replace('_', '-')

  return items
    .filter((item) => {
      if (!item.allowedRoles && !item.requiresRole) return true

      if (item.allowedRoles && Array.isArray(item.allowedRoles)) {
        return item.allowedRoles.some(
          (role) => String(role).toLowerCase().replace('_', '-') === normalizedUserRole
        )
      }
      if (item.requiresRole) {
        const reqRole = String(item.requiresRole).toLowerCase().replace('_', '-')
        return reqRole === normalizedUserRole
      }

      return true
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: filterNavItemsByRole(item.children, userRole),
        }
      }
      return item
    })
    .filter((item) => !item.children || item.children.length > 0)
}

function MainLayout({ setIsLoggedIn }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || '')

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem('userRole') || ''
      setUserRole(role)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const filteredNavItems = useMemo(() => {
    return filterNavItemsByRole(navigationItems, userRole)
  }, [userRole])

  useEffect(() => {
    if (!userRole) return

    const allowedPaths = filteredNavItems.flatMap((item) => {
      const paths = []
      if (item.path) paths.push(item.path)
      if (item.children) {
        item.children.forEach((child) => {
          if (child.path) paths.push(child.path)
        })
      }
      return paths
    })

    const commonPaths = ['/mypage', '/safety-management']

    const isAllowed =
      commonPaths.includes(location.pathname) ||
      allowedPaths.some(
        (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
      )

    if (!isAllowed) {
      const targetPath = ROLE_DEFAULT_PATH[userRole]

      if (targetPath && allowedPaths.includes(targetPath)) {
        navigate(targetPath, { replace: true })
      } else if (allowedPaths.length > 0) {
        navigate(allowedPaths[0], { replace: true })
      }
    }
  }, [location.pathname, filteredNavItems, userRole, navigate])

  return (
    <div className={isSidebarCollapsed ? 'app-shell sidebar-collapsed' : 'app-shell'}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        items={filteredNavItems}
        currentUserRole={userRole}
        onToggle={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
      />
      <div className="app-content">
        <Header items={filteredNavItems} setIsLoggedIn={setIsLoggedIn} />
        <main className="app-main">
          <Outlet />
        </main>
        <ServiceFooter />
      </div>
    </div>
  )
}

export default MainLayout