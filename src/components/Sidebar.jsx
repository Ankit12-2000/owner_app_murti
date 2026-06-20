import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

function Sidebar({ active = 'products' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const seller = JSON.parse(localStorage.getItem('seller') || '{}')
  const shop = JSON.parse(localStorage.getItem('shop') || '{}')

  const ownerName = seller.owner_name || 'Shop Owner'
  const shopName = shop.name || 'Murti Kala'

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('seller')
    localStorage.removeItem('shop')
    localStorage.removeItem('shopActive')
    navigate('/login')
  }

  const routes = {
    dashboard: '/dashboard',
    products: '/products',
    inquiries: '/inquiries',

    settings: '/settings',
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    )},
    { id: 'products', label: 'My Products', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )},
    { id: 'inquiries', label: 'Inquiries', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )},
  ]

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="mobile-header-brand">
          <span className="mobile-shop-name">{shopName}</span>
        </div>
      </header>

      {/* Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#e87b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <div>
              <span className="sidebar-brand-name">{shopName}</span>
              <span className="sidebar-brand-tag">Artisan Portal</span>
            </div>
            {/* Close button for mobile */}
            <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={routes[item.id]}
                className={`sidebar-link${active === item.id ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); navigate(routes[item.id]); setMobileOpen(false) }}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <a href="/shop" className="sidebar-shop-btn" onClick={(e) => e.preventDefault()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            View Public Shop
          </a>
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e87b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{ownerName}</span>
              <span className="sidebar-user-role">{shopName}</span>
            </div>
            <button className="sidebar-logout" aria-label="Logout" onClick={() => setShowLogoutModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="logout-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e87b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 className="logout-modal-title">Logout</h3>
            <p className="logout-modal-text">Are you sure you want to logout from your account?</p>
            <div className="logout-modal-buttons">
              <button className="logout-btn-cancel" onClick={() => setShowLogoutModal(false)}>No, Cancel</button>
              <button className="logout-btn-confirm" onClick={handleLogout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
