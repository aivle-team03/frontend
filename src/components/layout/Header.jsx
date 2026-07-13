import { useLocation } from 'react-router-dom'

function Header({ items }) {
  const location = useLocation()
  const currentItem = items.find((item) => item.path === location.pathname) ?? items[0]

  return (
    <header className="app-header">
      <h1>{currentItem.label}</h1>
    </header>
  )
}

export default Header
