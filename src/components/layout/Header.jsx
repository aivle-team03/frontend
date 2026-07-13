import { useLocation } from 'react-router-dom'

function Header({ items }) {
  const location = useLocation()
  const currentItem = items.find((item) => item.path === location.pathname) ?? items[0]
  const isHome = currentItem.path === '/'

  return (
    <header className="app-header">
      <div>
        <h1>{currentItem.label}</h1>
        {isHome && <p>오늘의 안전 현황과 조치 상태를 확인하세요.</p>}
      </div>
    </header>
  )
}

export default Header
