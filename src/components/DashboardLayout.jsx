import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import './DashboardLayout.css'

function DashboardLayout() {
  const location = useLocation()

  const getActive = () => {
    if (location.pathname.startsWith('/products')) return 'products'
    if (location.pathname.startsWith('/inquiries')) return 'inquiries'

    if (location.pathname.startsWith('/settings')) return 'settings'
    return 'dashboard'
  }

  return (
    <div className="dash-layout">
      <Sidebar active={getActive()} />
      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
