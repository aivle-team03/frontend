import bossLogo from '../../assets/boss-logo.png'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'


function SidebarIcon({ name }) {
  const commonProps = {
    className: 'sidebar-icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  if (name === 'home') {
    return (
      <svg {...commonProps}>
        <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z" />
      </svg>
    )
  }

  if (name === 'camera') {
    return (
      <svg {...commonProps}>
        <path d="M4 8h3l1.4-2h7.2L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
        <path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    )
  }

  if (name === 'checklist') {
    return (
      <svg {...commonProps}>
        <path d="M9 7h11M9 12h11M9 17h11" />
        <path d="m4 7 1 1 2-2M4 12l1 1 2-2M4 17l1 1 2-2" />
      </svg>
    )
  }

  if (name === 'history') {
    return (
      <svg {...commonProps}>
        <path d="M5 12a7 7 0 1 0 2.05-4.95L5 9" />
        <path d="M5 5v4h4M12 8v5l3 2" />
      </svg>
    )
  }

  if (name === 'education') {
    return (
      <svg {...commonProps}>
        <path d="m3 9 9-5 9 5-9 5-9-5Z" />
        <path d="M6 11.2V16c2.4 2.2 9.6 2.2 12 0v-4.8M21 9v6" />
      </svg>
    )
  }

  if (name === 'manage') {
    return <svg {...commonProps}><path d="M8 5h8M9 3h6v4H9zM6 7h12v14H6z" /><path d="M9 12h6M9 16h4" /></svg>
  }

  if (name === 'risk') {
    return <svg {...commonProps}><path d="M12 4 21 20H3L12 4Z" /><path d="M12 9v5M12 17h.01" /></svg>
  }

  return (
    <svg {...commonProps}>
      <path d="M9.2 9a3 3 0 1 1 4.7 2.45c-.95.62-1.4 1.14-1.4 2.05" />
      <path d="M12 17.5h.01" />
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    </svg>
  )
}

function Sidebar({ isCollapsed, items, currentUserRole, onToggle }) {
  const location = useLocation()
  const [openSubmenu, setOpenSubmenu] = useState(null)

  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <div className="sidebar-logo">
        <Link to="/" aria-label="Home">
          <img src={bossLogo} alt="BOSS" />
        </Link>
      </div>
      <nav className="sidebar-nav" aria-label="Main menu">
        {items.map((item) => {
          const children = (item.children ?? []).filter((child) => !child.requiresRole || child.requiresRole === currentUserRole)
          const isChildRouteActive = children.some((child) => location.pathname === child.path)
          const isParentActive = location.pathname === item.path || (item.path === '/monitoring' && location.pathname === '/monitoringdetail') || isChildRouteActive
          const parentKey = item.path ?? item.label
          const hasManualStateForCurrentEntry = openSubmenu?.locationKey === location.key
          const isSubmenuOpen = children.length > 0 && (isChildRouteActive || (hasManualStateForCurrentEntry && openSubmenu.key === parentKey))
          return <div className={`sidebar-item${children.length ? ' has-children' : ''}${isParentActive ? ' is-active' : ''}${isChildRouteActive ? ' is-child-active' : ''}${isSubmenuOpen ? ' is-open' : ''}`} key={parentKey}>
            {children.length > 0 ? <button className="sidebar-tab" type="button" title={isCollapsed ? item.label : undefined} aria-expanded={isSubmenuOpen} onClick={() => setOpenSubmenu((current) => current?.key === parentKey && current.locationKey === location.key ? null : { key: parentKey, locationKey: location.key })}><span className="sidebar-icon-box"><SidebarIcon name={item.icon} /></span><span className="sidebar-label">{item.label}</span><span className="sidebar-submenu-caret" aria-hidden="true">›</span></button> : <NavLink className="sidebar-tab" end={item.path === '/'} title={isCollapsed ? item.label : undefined} to={item.path} onClick={() => setOpenSubmenu(null)}><span className="sidebar-icon-box"><SidebarIcon name={item.icon} /></span><span className="sidebar-label">{item.label}</span></NavLink>}
            {children.length > 0 && <div className="sidebar-submenu" aria-label={`${item.label} 하위 메뉴`}>{children.map((child) => <NavLink className={({ isActive }) => isActive ? 'sidebar-submenu-link is-active' : 'sidebar-submenu-link'} key={child.path} to={child.path}><span className="sidebar-submenu-icon"><SidebarIcon name={child.icon} /></span>{child.label}</NavLink>)}</div>}
          </div>
        })}
      </nav>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
        onClick={onToggle}
      >
        <span aria-hidden="true"></span>
      </button>
    </aside >
  )
}

export default Sidebar
