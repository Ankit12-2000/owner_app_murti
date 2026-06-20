import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE, UPLOADS_BASE } from '../config'
import Loader from '../components/Loader'
import './MyProducts.css'

function getDraftKey() {
  try {
    const seller = JSON.parse(localStorage.getItem('seller') || '{}')
    return `productDrafts_${seller.id || 'unknown'}`
  } catch { return 'productDrafts_unknown' }
}

function MyProducts() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(getDraftKey()) || '[]') } catch { return [] }
  })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/product/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        console.log('Products data:', data.data)
        setProducts(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()

  }, [])

  // Delete product
  const handleDelete = async (product) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    const productId = product.product_code || product.id
    const shop = JSON.parse(localStorage.getItem('shop') || '{}')
    const shopCode = product.shop_code || shop.shop_code || shop.id
    console.log('Deleting:', { productId, shopCode })
    setDeleting(productId)
    try {
      const res = await fetch(`${API_BASE}/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_code: productId, shop_code: shopCode }),
      })
      const data = await res.json()
      console.log('Delete response:', data)
      if (data.success) {
        setProducts((prev) => prev.filter((p) => (p.product_code || p.id) !== productId))
      } else {
        alert(data.message || 'Failed to delete product.')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete product.')
    } finally {
      setDeleting(null)
    }
  }

  const deleteDraft = (id) => {
    const updated = drafts.filter((d) => d.id !== id)
    localStorage.setItem(getDraftKey(), JSON.stringify(updated))
    setDrafts(updated)
  }

  const editDraft = (draft) => {
    navigate('/products/add', { state: { draft } })
  }

  const formatDraftDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const getImageUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${UPLOADS_BASE}${url}`
  }

  return (
    <>
      {/* Top Bar */}
      <div className="mp-topbar">
        <div className="mp-search-wrapper">
          <svg className="mp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="mp-search"
            placeholder="Search your products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mp-topbar-actions">
          <button className="mp-notif-btn" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a4a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button className="mp-add-btn" onClick={() => navigate('/products/add')}>
            <span className="mp-add-icon">+</span> <span className="mp-add-text">Add New Product</span>
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="mp-header">
        <div>
          <h1 className="mp-title">My Products</h1>
          <p className="mp-subtitle">Manage and showcase your artisan murtis</p>
        </div>
        <button className="mp-filter-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filter
        </button>
      </div>

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="mp-drafts-section">
          <h3 className="mp-drafts-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e87b35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            Drafts ({drafts.length})
          </h3>
          <div className="mp-drafts-scroll">
            {drafts.map((draft) => (
              <div key={draft.id} className="mp-draft-card">
                <div className="mp-draft-card-img" onClick={() => editDraft(draft)}>
                  {draft.images && draft.images[0] ? (
                    <img src={draft.images[0]} alt={draft.name} />
                  ) : (
                    <div className="mp-draft-card-noimg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c4956a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                  <span className="mp-badge mp-badge-draft">DRAFT</span>
                </div>
                <div className="mp-draft-card-body">
                  <h4 onClick={() => editDraft(draft)}>{draft.name || 'Untitled'}</h4>
                  <p>{draft.material && `${draft.material} · `}{draft.price ? `₹${Number(draft.price).toLocaleString('en-IN')}` : ''}</p>
                  <span className="mp-draft-date">{formatDraftDate(draft.savedAt)}</span>
                </div>
                <div className="mp-draft-card-actions">
                  <button className="mp-icon-btn" aria-label="Edit draft" onClick={() => editDraft(draft)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button className="mp-icon-btn mp-icon-btn-danger" aria-label="Delete draft" onClick={() => deleteDraft(draft.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <Loader text="Loading products..." />}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="mp-empty">
          <p>No products yet. Start by adding your first product!</p>
          <button className="mp-add-btn" onClick={() => navigate('/products/add')}>
            + Add New Product
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <div className="mp-grid">
          {filtered.map((product) => (
            <div key={product.id} className="mp-card">
              <div className="mp-card-img">
                {product.image_url ? (
                  <img src={getImageUrl(product.image_url)} alt={product.name} />
                ) : (
                  <div className="mp-card-no-img">No Image</div>
                )}
                <span className={`mp-badge ${product.is_active ? 'in_stock' : 'inactive'}`}>
                  {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="mp-card-body">
                <div className="mp-card-row">
                  <h3 className="mp-card-name">{product.name}</h3>
                  <span className="mp-card-price">&#x20B9;{Number(product.price).toLocaleString('en-IN')}</span>
                </div>
                <p className="mp-card-desc">
                  {product.description ? product.description.substring(0, 40) + '...' : product.category_name || ''}
                </p>
                <div className="mp-card-footer">
                  <span className="mp-card-stock">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    {product.material || 'N/A'}
                  </span>
                  <div className="mp-card-actions">
                    <button className="mp-icon-btn" aria-label="Edit" onClick={() => navigate(`/products/edit/${product.product_code || product.id}`)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="mp-icon-btn mp-icon-btn-danger"
                      aria-label="Delete"
                      disabled={deleting === (product.product_code || product.id)}
                      onClick={() => handleDelete(product)}
                    >
                      {deleting === (product.product_code || product.id) ? (
                        <span className="mp-spinner" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Product Card */}
          <div className="mp-card mp-card-add" onClick={() => navigate('/products/add')}>
            <div className="mp-card-add-content">
              <div className="mp-card-add-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c4956a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3 className="mp-card-add-title">Add New Product</h3>
              <p className="mp-card-add-text">Create a new listing for your artisan collection</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MyProducts
