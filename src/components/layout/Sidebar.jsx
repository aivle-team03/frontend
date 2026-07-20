import bossLogo from '../../assets/boss-logo.png'
import { NavLink, Link, useLocation } from 'react-router-dom'


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

  return (
    <svg {...commonProps}>
      <path d="M9.2 9a3 3 0 1 1 4.7 2.45c-.95.62-1.4 1.14-1.4 2.05" />
      <path d="M12 17.5h.01" />
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    </svg>
  )
}

function Sidebar({ isCollapsed, items, onToggle }) {
  const location = useLocation()

  return (
    <aside className="app-sidebar" aria-label="Primary navigation">
      <div className="sidebar-logo">
        <Link to="/" aria-label="Home">
          <img src={bossLogo} alt="BOSS" />
        </Link>
      </div>
      <nav className="sidebar-nav" aria-label="Main menu">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) => {
              const isMonitoringDetail = item.path === '/monitoring' && location.pathname === '/monitoringdetail'
              return isActive || isMonitoringDetail ? 'sidebar-tab is-active' : 'sidebar-tab'
            }}
            end={item.path === '/'}
            key={item.path}
            title={isCollapsed ? item.label : undefined}
            to={item.path}
          >
            <span className="sidebar-icon-box">
              <SidebarIcon name={item.icon} />
            </span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
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
