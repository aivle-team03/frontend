import bossLogo from '../../assets/boss-logo.png'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useUiLanguage } from '../../utils/uiLanguage.js'


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

  if (name === 'check') {
    return (
      <svg {...commonProps}>
        <path d="M20 6 9 17l-5-5" />
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

  if (name === 'board') {
    return (
      <svg {...commonProps}>
        <path d="M5 5h14v14H5V5Z" />
        <path d="M8 9h8M8 13h5" />
        <path d="M17 17h.01" />
      </svg>
    )
  }

  if (name === 'report') {
    return (
      <svg {...commonProps}>
        <path d="M6 3h9l3 3v15H6V3Z" />
        <path d="M14 3v4h4" />
        <path d="M9 17v-4M12 17V9M15 17v-6" />
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

function SidebarLegacy({ isCollapsed, items, currentUserRole, onToggle }) {
  const location = useLocation()
  const { t } = useUiLanguage()
  const [openSubmenu, setOpenSubmenu] = useState(null)

  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <div className="sidebar-logo">
        <Link to="/" aria-label="Home">
          <img src={bossLogo} alt="BOSS" />
        </Link>
      </div>
      <nav className="sidebar-nav" aria-label="Main menu" onScroll={() => isCollapsed && setOpenSubmenu(null)}>
        {items.map((item) => {
          // 💡 MainLayout에서 이미 필터링된 children을 그대로 사용합니다.
          const children = item.children ?? []
          const isChildRouteActive = children.some((child) => location.pathname === child.path)
          const isParentActive = location.pathname === item.path || (item.path === '/monitoring' && location.pathname === '/monitoringdetail') || isChildRouteActive
          const parentKey = item.path ?? item.label
          const hasManualStateForCurrentEntry = openSubmenu?.locationKey === location.key
          const isSubmenuOpen = children.length > 0 && (isChildRouteActive || (hasManualStateForCurrentEntry && openSubmenu.key === parentKey))
          const submenuLinks = children.map((child) => (
            <NavLink
              className={({ isActive }) => isActive ? 'sidebar-submenu-link is-active' : 'sidebar-submenu-link'}
              end
              key={child.path}
              to={child.path}
              onClick={() => setOpenSubmenu(null)}
            >
              <span className="sidebar-submenu-icon"><SidebarIcon name={child.icon} /></span>
              {t(child.label)}
            </NavLink>
          ))
          const popupStyle = openSubmenu?.anchor ? { '--sidebar-submenu-top': `${openSubmenu.anchor.top}px`, '--sidebar-submenu-left': `${openSubmenu.anchor.left}px` } : undefined

          return (
            <div className={`sidebar-item${children.length ? ' has-children' : ''}${isParentActive ? ' is-active' : ''}${isChildRouteActive ? ' is-child-active' : ''}${isSubmenuOpen ? ' is-open' : ''}`} key={parentKey}>
              {children.length > 0 ? (
                <button className="sidebar-tab" type="button" title={isCollapsed ? t(item.label) : undefined} aria-expanded={isSubmenuOpen} onClick={(event) => toggleSubmenu(parentKey, event)}>
                  <span className="sidebar-icon-box"><SidebarIcon name={item.icon} /></span>
                  <span className="sidebar-label">{t(item.label)}</span>
                  <span className="sidebar-submenu-caret" aria-hidden="true">›</span>
                </button>
              ) : (
                <NavLink className="sidebar-tab" end={item.path === '/'} title={isCollapsed ? t(item.label) : undefined} to={item.path} onClick={() => setOpenSubmenu(null)}>
                  <span className="sidebar-icon-box"><SidebarIcon name={item.icon} /></span>
                  <span className="sidebar-label">{t(item.label)}</span>
                </NavLink>
              )}
              {children.length > 0 && !isCollapsed && <div className="sidebar-submenu" aria-label={`${t(item.label)} submenu`}>{submenuLinks}</div>}
              {children.length > 0 && isCollapsed && isSubmenuOpen && openSubmenu?.anchor && createPortal(<div className="sidebar-submenu sidebar-submenu-popover" aria-label={`${t(item.label)} submenu`} style={popupStyle}>{submenuLinks}</div>, document.body)}
            </div>
          )
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

function SidebarWithFlyout({ isCollapsed, items, currentUserRole, onToggle }) {
  const location = useLocation()
  const { t } = useUiLanguage()
  const [openSubmenu, setOpenSubmenu] = useState(null)

  useEffect(() => {
    if (!isCollapsed) setOpenSubmenu(null)
  }, [isCollapsed])

  const toggleSubmenu = (parentKey, event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const top = Math.max(12, Math.min(bounds.top, window.innerHeight - 220))

    setOpenSubmenu((current) => current?.key === parentKey && current.locationKey === location.key
      ? null
      : { key: parentKey, locationKey: location.key, anchor: { top, left: bounds.right + 10 } })
  }

  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <div className="sidebar-logo">
        <Link to="/" aria-label="Home"><img src={bossLogo} alt="BOSS" /></Link>
      </div>
      <nav className="sidebar-nav" aria-label="Main menu" onScroll={() => isCollapsed && setOpenSubmenu(null)}>
        {items.map((item) => {
          // 💡 MainLayout에서 이미 필터링된 children을 그대로 사용합니다.
          const children = item.children ?? []
          const isChildRouteActive = children.some((child) => location.pathname === child.path)
          const isParentActive = location.pathname === item.path || (item.path === '/monitoring' && location.pathname === '/monitoringdetail') || isChildRouteActive
          const parentKey = item.path ?? item.label
          const hasManualStateForCurrentEntry = openSubmenu?.locationKey === location.key
          const isSubmenuOpen = children.length > 0 && (isChildRouteActive || (hasManualStateForCurrentEntry && openSubmenu.key === parentKey))
          const submenuLinks = children.map((child) => (
            <NavLink
              className={({ isActive }) => isActive ? 'sidebar-submenu-link is-active' : 'sidebar-submenu-link'}
              end
              key={child.path}
              to={child.path}
              onClick={() => setOpenSubmenu(null)}
            >
              <span className="sidebar-submenu-icon"><SidebarIcon name={child.icon} /></span>
              {t(child.label)}
            </NavLink>
          ))
          const popupStyle = openSubmenu?.anchor ? { '--sidebar-submenu-top': `${openSubmenu.anchor.top}px`, '--sidebar-submenu-left': `${openSubmenu.anchor.left}px` } : undefined

          return (
            <div className={`sidebar-item${children.length ? ' has-children' : ''}${isParentActive ? ' is-active' : ''}${isChildRouteActive ? ' is-child-active' : ''}${isSubmenuOpen ? ' is-open' : ''}`} key={parentKey}>
              {children.length > 0 ? (
                <button className="sidebar-tab" type="button" title={isCollapsed ? t(item.label) : undefined} aria-expanded={isSubmenuOpen} onClick={(event) => toggleSubmenu(parentKey, event)}>
                  <span className="sidebar-icon-box"><SidebarIcon name={item.icon} /></span>
                  <span className="sidebar-label">{t(item.label)}</span>
                  <span className="sidebar-submenu-caret" aria-hidden="true">›</span>
                </button>
              ) : (
                <NavLink className="sidebar-tab" end={item.path === '/'} title={isCollapsed ? t(item.label) : undefined} to={item.path} onClick={() => setOpenSubmenu(null)}>
                  <span className="sidebar-icon-box"><SidebarIcon name={item.icon} /></span>
                  <span className="sidebar-label">{t(item.label)}</span>
                </NavLink>
              )}
              {children.length > 0 && !isCollapsed && <div className="sidebar-submenu" aria-label={`${t(item.label)} submenu`}>{submenuLinks}</div>}
              {children.length > 0 && isCollapsed && isSubmenuOpen && openSubmenu?.anchor && createPortal(<div className="sidebar-submenu sidebar-submenu-popover" aria-label={`${t(item.label)} submenu`} style={popupStyle}>{submenuLinks}</div>, document.body)}
            </div>
          )
        })}
      </nav>
      <button className="sidebar-toggle" type="button" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!isCollapsed} onClick={onToggle}><span aria-hidden="true" /></button>
    </aside>
  )
}

export default SidebarWithFlyout
