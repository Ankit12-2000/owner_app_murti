import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Loader from '../components/Loader'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [period, setPeriod] = useState('today')
  const [loading, setLoading] = useState(true)
  const [sellerName, setSellerName] = useState('')
  const [shopName, setShopName] = useState('')
  const [stats, setStats] = useState({ total_products: 0, total_inquiries: 0, new_leads: 0 })
  const [recentInquiries, setRecentInquiries] = useState([])

  const fetchDashboard = async (p) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/dashboard?period=${p}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setSellerName(data.data.seller?.name || 'Seller')
        setShopName(data.data.seller?.shop_name || 'Murti Kala')
        setStats(data.data.stats || { total_products: 0, total_inquiries: 0, new_leads: 0 })
        setRecentInquiries(data.data.recent_inquiries || [])
      }
    } catch (err) {
      console.error('Dashboard fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard(period)
  }, [period])

  const statsData = [
    { label: 'Total Products', value: stats.total_products, icon: 'product', color: '#e87b35' },
    { label: 'Total Inquiries', value: stats.total_inquiries, icon: 'inquiry', color: '#6366f1' },
    { label: 'New Leads', value: stats.new_leads, icon: 'leads', color: '#16a34a' },
  ]

  const periodLabels = { today: 'Today', weekly: 'Weekly', monthly: 'Monthly' }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      {/* Top Bar */}
      <div className="db-topbar">
        <div className="db-search-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" className="db-search" placeholder="Search inquiries, products or analytics..." />
        </div>
        <div className="db-topbar-actions">
          <button className="db-icon-circle" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a4a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button className="db-icon-circle" aria-label="Help">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a4a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <button className="db-new-btn" onClick={() => navigate('/products/add')}>
            + New Murti
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading dashboard..." />
      ) : (
        <div className="db-body">
          {/* Header */}
          <div className="db-header">
            <div>
              <h1 className="db-greeting">Namaste, {sellerName}!</h1>
              <p className="db-greeting-sub">Here is what's happening with your {shopName} inquiries {period === 'today' ? 'today' : `this ${period === 'weekly' ? 'week' : 'month'}`}.</p>
            </div>
            <div className="db-period-toggle">
              {['today', 'weekly', 'monthly'].map((p) => (
                <button key={p} className={`db-period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="db-stats">
            {statsData.map((s) => (
              <div key={s.label} className="db-stat-card">
                <div className="db-stat-top">
                  <div className="db-stat-icon" style={{ background: `${s.color}15` }}>
                    {s.icon === 'product' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    )}
                    {s.icon === 'inquiry' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                    {s.icon === 'leads' && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="db-stat-label">{s.label}</span>
                <span className="db-stat-value">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="db-section">
            <h2 className="db-section-title">Quick Actions</h2>
            <div className="db-quick-actions">
              <button className="db-action-btn db-action-primary" onClick={() => navigate('/products/add')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add New Product
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <button className="db-action-btn" onClick={() => navigate('/products')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="18" y2="18" />
                </svg>
                Manage Products
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <button className="db-action-btn" onClick={() => navigate('/inquiries')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                View Recent Inquiries
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>

          {/* Recent Customer Inquiries */}
          <div className="db-table-card">
            <div className="db-table-header">
              <h2 className="db-section-title">Recent Customer Inquiries</h2>
              <a href="/inquiries" className="db-view-all" onClick={(e) => { e.preventDefault(); navigate('/inquiries') }}>View All</a>
            </div>
            {recentInquiries.length === 0 ? (
              <p className="db-no-data">No inquiries yet.</p>
            ) : (
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>LEAD ID</th>
                      <th>PRODUCT INTEREST</th>
                      <th>MESSAGE</th>
                      <th>PHONE NUMBER</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.map((inq) => (
                      <tr key={inq.id}>
                        <td className="db-lead-id">#{inq.id}</td>
                        <td>
                          <div className="db-product-cell">
                            {inq.product_image ? (
                              <img src={inq.product_image} alt="" className="db-product-thumb-img" />
                            ) : (
                              <div className="db-product-thumb" />
                            )}
                            {inq.product_name}
                          </div>
                        </td>
                        <td className="db-message">{inq.message ? (inq.message.length > 50 ? inq.message.substring(0, 50) + '...' : inq.message) : '-'}</td>
                        <td className="db-phone">{inq.customer_phone}</td>
                        <td>{formatDate(inq.created_at)}</td>
                        <td>
                          <span className={`db-status ${inq.status}`}>
                            {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Cards */}
          <div className="db-bottom-row">
            {/* Inquiry Insights */}
            <div className="db-card">
              <h3 className="db-card-title">Inquiry Insights</h3>
              <div className="db-insight-bar-row">
                <div className="db-insight-bar">
                  <div className="db-insight-fill" style={{ width: `${stats.total_inquiries > 0 ? Math.min((stats.total_inquiries / 150) * 100, 100) : 0}%` }} />
                </div>
                <div className="db-insight-pct">
                  <span className="db-pct-val">{stats.total_inquiries > 0 ? Math.min(Math.round((stats.total_inquiries / 150) * 100), 100) : 0}%</span>
                  <span className="db-pct-label">Target</span>
                </div>
              </div>
              <p className="db-insight-text">
                {stats.total_inquiries >= 150
                  ? 'You have reached your monthly response goal of 150 inquiries!'
                  : `You are ${150 - stats.total_inquiries} away from your monthly response goal of 150 inquiries. Keep up the great communication!`}
              </p>
              <button className="db-report-btn">View Lead Report</button>
            </div>

            {/* Stats Summary */}
            <div className="db-card">
              <h3 className="db-card-title">Quick Summary</h3>
              <div className="db-stock-item">
                <div className="db-stock-icon" style={{ background: '#fef0e5' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e87b35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div className="db-stock-info">
                  <span className="db-stock-name">{stats.total_products} Products</span>
                  <span className="db-stock-sub">Listed in your shop</span>
                </div>
                <button className="db-restock-btn" onClick={() => navigate('/products')}>View</button>
              </div>
              <div className="db-stock-item">
                <div className="db-stock-icon" style={{ background: '#ede9fe' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="db-stock-info">
                  <span className="db-stock-name">{stats.total_inquiries} Inquiries</span>
                  <span className="db-stock-sub">Total received</span>
                </div>
              </div>
              <div className="db-stock-item">
                <div className="db-stock-icon" style={{ background: '#dcfce7' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div className="db-stock-info">
                  <span className="db-stock-name">{stats.new_leads} New Leads</span>
                  <span className="db-stock-sub">Ready to connect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard
