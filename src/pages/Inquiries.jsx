import { useState, useEffect } from 'react'
import { API_BASE } from '../config'
import Loader from '../components/Loader'
import './Inquiries.css'

function Inquiries() {
  const token = localStorage.getItem('token')

  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchInquiries = async (status) => {
    setLoading(true)
    try {
      const url = status === 'all' ? `${API_BASE}/inquiries/my` : `${API_BASE}/inquiries/my?status=${status}`
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setInquiries(data.data || [])
    } catch (err) {
      console.error('Failed to fetch inquiries', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries(filter)
  }, [filter])

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        )
      }
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filtered = inquiries.filter((inq) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (inq.product_name || '').toLowerCase().includes(q) ||
      (inq.customer_name || '').toLowerCase().includes(q) ||
      (inq.customer_phone || '').includes(q)
    )
  })

  const statusOptions = ['pending', 'responded', 'converted']
  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'responded', label: 'Responded' },
    { key: 'converted', label: 'Converted' },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="iq-topbar">
        <div className="iq-search-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="iq-search"
            placeholder="Search by product, customer or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Header */}
      <div className="iq-header">
        <div>
          <h1 className="iq-title">Inquiries</h1>
          <p className="iq-subtitle">Manage and respond to customer inquiries</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="iq-filters">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            className={`iq-filter-btn${filter === tab.key ? ' active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <Loader text="Loading inquiries..." />}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="iq-empty">No inquiries found.</div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="iq-table-card">
          <div className="iq-table-wrap">
            <table className="iq-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PRODUCT</th>
                  <th>PHONE</th>
                  <th>MESSAGE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inq) => (
                  <tr key={inq.id}>
                    <td className="iq-id">#{inq.id}</td>
                    <td>
                      <div className="iq-product-cell">
                        {inq.product_image ? (
                          <img src={inq.product_image} alt="" className="iq-product-img" />
                        ) : (
                          <div className="iq-product-placeholder" />
                        )}
                        <span>{inq.product_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="iq-phone">{inq.customer_phone || 'N/A'}</td>
                    <td className="iq-message">{inq.message ? (inq.message.length > 60 ? inq.message.substring(0, 60) + '...' : inq.message) : '-'}</td>
                    <td className="iq-date">{formatDate(inq.created_at)}</td>
                    <td>
                      <span className={`iq-status ${inq.status}`}>
                        {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {inq.status !== 'converted' && (
                        <select
                          className="iq-action-select"
                          value=""
                          disabled={updatingId === inq.id}
                          onChange={(e) => {
                            if (e.target.value) updateStatus(inq.id, e.target.value)
                          }}
                        >
                          <option value="" disabled>{updatingId === inq.id ? 'Updating...' : 'Change'}</option>
                          {statusOptions
                            .filter((s) => s !== inq.status)
                            .map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                      )}
                      {inq.status === 'converted' && (
                        <span className="iq-done">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && filtered.length > 0 && (
        <div className="iq-mobile-cards">
          {filtered.map((inq) => (
            <div key={inq.id} className="iq-mobile-card">
              <div className="iq-mobile-top">
                <div className="iq-product-cell">
                  {inq.product_image ? (
                    <img src={inq.product_image} alt="" className="iq-product-img" />
                  ) : (
                    <div className="iq-product-placeholder" />
                  )}
                  <div>
                    <span className="iq-mobile-product">{inq.product_name || 'N/A'}</span>
                    <span className="iq-mobile-id">#{inq.id}</span>
                  </div>
                </div>
                <span className={`iq-status ${inq.status}`}>
                  {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                </span>
              </div>
              <div className="iq-mobile-info">
                <div className="iq-mobile-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a href={`tel:${inq.customer_phone}`}>{inq.customer_phone || 'N/A'}</a>
                </div>
                <div className="iq-mobile-row iq-mobile-date">
                  {formatDate(inq.created_at)}
                </div>
              </div>
              {inq.message && <p className="iq-mobile-message">{inq.message}</p>}
              {inq.status !== 'converted' && (
                <div className="iq-mobile-actions">
                  {statusOptions
                    .filter((s) => s !== inq.status)
                    .map((s) => (
                      <button
                        key={s}
                        className={`iq-mobile-action-btn ${s}`}
                        disabled={updatingId === inq.id}
                        onClick={() => updateStatus(inq.id, s)}
                      >
                        {updatingId === inq.id ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Inquiries
