import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_BASE } from '../config'
import { ButtonLoader } from '../components/Loader'
import './AddProduct.css'

const emptyForm = { name: '', category_id: '', price: '', material: '', size: '', description: '' }

function getDraftKey() {
  try {
    const seller = JSON.parse(localStorage.getItem('seller') || '{}')
    return `productDrafts_${seller.id || 'unknown'}`
  } catch { return 'productDrafts_unknown' }
}

function getDrafts() {
  try { return JSON.parse(localStorage.getItem(getDraftKey()) || '[]') } catch { return [] }
}

function saveDrafts(drafts) {
  localStorage.setItem(getDraftKey(), JSON.stringify(drafts))
}

function AddProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const seller = JSON.parse(localStorage.getItem('seller') || '{}')
  const token = localStorage.getItem('token')
  const incomingDraft = location.state?.draft || null

  const [formData, setFormData] = useState(() => {
    if (incomingDraft) {
      return {
        name: incomingDraft.name || '',
        category_id: incomingDraft.category_id || '',
        price: incomingDraft.price || '',
        material: incomingDraft.material || '',
        size: incomingDraft.size || '',
        description: incomingDraft.description || '',
      }
    }
    return { ...emptyForm }
  })
  const [sizeUnit, setSizeUnit] = useState(() => {
    if (incomingDraft?.sizeUnit) return incomingDraft.sizeUnit
    const s = (incomingDraft?.size || '').toUpperCase()
    if (s.includes('AS PER CLIENT')) return 'AS PER CLIENT'
    if (s.includes('FEET') || s.includes('FT')) return 'FEET'
    if (s.includes('METER')) return 'METER'
    if (s.includes('MM')) return 'MM'
    if (s.includes('CM')) return 'CM'
    return 'INCH'
  })
  const [imageFiles, setImageFiles] = useState([null, null, null, null, null])
  const [imagePreviews, setImagePreviews] = useState(() => {
    if (incomingDraft?.images) {
      const restored = [null, null, null, null, null]
      incomingDraft.images.forEach((img, i) => { if (i < 5) restored[i] = img })
      return restored
    }
    return [null, null, null, null, null]
  })
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftMsg, setDraftMsg] = useState('')
  const [drafts, setDrafts] = useState(getDrafts)
  const [showDrafts, setShowDrafts] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState(incomingDraft?.id || null)
  const fileRefs = useRef([])

  // Migrate old single draft to new format
  useEffect(() => {
    const oldDraft = localStorage.getItem('productDraft')
    if (oldDraft) {
      try {
        const parsed = JSON.parse(oldDraft)
        if (parsed.name) {
          const existing = getDrafts()
          saveDrafts([{ id: Date.now(), ...parsed, savedAt: new Date().toISOString() }, ...existing])
          setDrafts(getDrafts())
        }
      } catch { /* ignore */ }
      localStorage.removeItem('productDraft')
    }
  }, [])

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then((res) => res.json())
      .then((data) => { if (data.success) setCategories(data.data) })
      .catch(() => {})

    fetch(`${API_BASE}/product/materials`)
      .then((res) => res.json())
      .then((data) => { if (data.success) setMaterials(data.data) })
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleImageChange = (index, e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFiles((prev) => { const c = [...prev]; c[index] = file; return c })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => { const c = [...prev]; c[index] = reader.result; return c })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index) => {
    setImageFiles((prev) => { const c = [...prev]; c[index] = null; return c })
    setImagePreviews((prev) => { const c = [...prev]; c[index] = null; return c })
    if (fileRefs.current[index]) fileRefs.current[index].value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('seller_id', seller.id)
      fd.append('name', formData.name)
      fd.append('category_id', formData.category_id)
      fd.append('price', formData.price)
      fd.append('material', formData.material)
      fd.append('size', sizeUnit === 'AS PER CLIENT' ? 'AS PER CLIENT' : (formData.size ? `${formData.size} ${sizeUnit}` : ''))
      fd.append('description', formData.description)
      imageFiles.forEach((file) => { if (file) fd.append('images', file) })

      const res = await fetch(`${API_BASE}/product`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (data.success) {
        if (currentDraftId) {
          const updated = getDrafts().filter((d) => d.id !== currentDraftId)
          saveDrafts(updated)
        }
        navigate('/products')
      } else {
        setError(data.message || 'Failed to add product.')
      }
    } catch (err) {
      setError('Server error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // ── Draft handlers ──
  const handleSaveDraft = () => {
    if (!formData.name.trim()) {
      setDraftMsg('Please enter a product name to save draft.')
      setTimeout(() => setDraftMsg(''), 3000)
      return
    }

    const existing = getDrafts()

    if (currentDraftId) {
      // Update existing draft
      const updated = existing.map((d) =>
        d.id === currentDraftId
          ? { ...d, ...formData, sizeUnit, images: imagePreviews.filter(Boolean), savedAt: new Date().toISOString() }
          : d
      )
      saveDrafts(updated)
      setDrafts(updated)
      setDraftMsg('Draft updated!')
    } else {
      // Create new draft
      const newId = Date.now()
      const draft = {
        id: newId,
        ...formData,
        sizeUnit,
        images: imagePreviews.filter(Boolean),
        savedAt: new Date().toISOString(),
      }
      const updated = [draft, ...existing]
      saveDrafts(updated)
      setDrafts(updated)
      setCurrentDraftId(newId)
      setDraftMsg('Draft saved!')
    }
    setTimeout(() => setDraftMsg(''), 3000)
  }

  const loadDraft = (draft) => {
    setFormData({
      name: draft.name || '',
      category_id: draft.category_id || '',
      price: draft.price || '',
      material: draft.material || '',
      size: draft.size || '',
      description: draft.description || '',
    })
    setSizeUnit(draft.sizeUnit || 'INCH')
    setImageFiles([null, null, null, null, null])
    const restored = [null, null, null, null, null]
    if (draft.images) {
      draft.images.forEach((img, i) => { if (i < 5) restored[i] = img })
    }
    setImagePreviews(restored)
    setCurrentDraftId(draft.id)
    setShowDrafts(false)
    setDraftMsg('Draft loaded!')
    setTimeout(() => setDraftMsg(''), 3000)
  }

  const deleteDraft = (id) => {
    const updated = getDrafts().filter((d) => d.id !== id)
    saveDrafts(updated)
    setDrafts(updated)
  }

  const formatDraftDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="ap-page">
      <div className="ap-content">
        <div className="ap-title-row">
          <div>
            <h1 className="ap-title">Add New Product</h1>
            <p className="ap-subtitle">Share the details of your latest creation with collectors.</p>
          </div>
          {drafts.length > 0 && (
            <button type="button" className="ap-drafts-toggle" onClick={() => setShowDrafts(!showDrafts)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              Drafts ({drafts.length})
            </button>
          )}
        </div>

        {/* Drafts Panel */}
        {showDrafts && (
          <div className="ap-drafts-panel">
            <div className="ap-drafts-header">
              <h3>Saved Drafts</h3>
              <button type="button" className="ap-drafts-close" onClick={() => setShowDrafts(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="ap-drafts-list">
              {drafts.map((draft) => (
                <div key={draft.id} className="ap-draft-item">
                  {draft.images && draft.images[0] && (
                    <img src={draft.images[0]} alt="" className="ap-draft-thumb" onClick={() => loadDraft(draft)} />
                  )}
                  <div className="ap-draft-info" onClick={() => loadDraft(draft)}>
                    <span className="ap-draft-name">{draft.name || 'Untitled'}</span>
                    <span className="ap-draft-meta">
                      {draft.material && `${draft.material} · `}
                      {draft.price && `₹${draft.price} · `}
                      {formatDraftDate(draft.savedAt)}
                    </span>
                  </div>
                  <button type="button" className="ap-draft-delete" onClick={() => deleteDraft(draft.id)} title="Delete draft">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {draftMsg && <div className={`ap-draft-msg ${draftMsg.includes('Please') ? 'warn' : ''}`}>{draftMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Product Images */}
          <div className="ap-field">
            <label className="ap-label">PRODUCT IMAGES</label>
            <div className="ap-images-grid">
              <div className="ap-img-box ap-img-main" onClick={() => !imagePreviews[0] && fileRefs.current[0]?.click()}>
                {imagePreviews[0] ? (
                  <>
                    <img src={imagePreviews[0]} alt="Main" className="ap-img-preview" onClick={() => fileRefs.current[0]?.click()} />
                    <button type="button" className="ap-img-remove" onClick={(e) => { e.stopPropagation(); removeImage(0) }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </>
                ) : (
                  <div className="ap-img-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c4956a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Upload Main Photo</span>
                  </div>
                )}
                <input ref={(el) => (fileRefs.current[0] = el)} type="file" accept="image/*" onChange={(e) => handleImageChange(0, e)} hidden />
              </div>
              <div className="ap-img-secondary">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="ap-img-box ap-img-small" onClick={() => !imagePreviews[i] && fileRefs.current[i]?.click()}>
                    {imagePreviews[i] ? (
                      <>
                        <img src={imagePreviews[i]} alt={`Photo ${i}`} className="ap-img-preview" onClick={() => fileRefs.current[i]?.click()} />
                        <button type="button" className="ap-img-remove" onClick={(e) => { e.stopPropagation(); removeImage(i) }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </>
                    ) : (
                      <span className="ap-img-plus">+</span>
                    )}
                    <input ref={(el) => (fileRefs.current[i] = el)} type="file" accept="image/*" onChange={(e) => handleImageChange(i, e)} hidden />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div className="ap-field">
            <label className="ap-label" htmlFor="name">Product Name</label>
            <input type="text" id="name" name="name" className="ap-input" placeholder="e.g. Marble Radha Krishna 18 inch" value={formData.name} onChange={handleChange} required />
          </div>

          {/* Category & Price */}
          <div className="ap-row">
            <div className="ap-field ap-field-half">
              <label className="ap-label" htmlFor="category_id">Category</label>
              <select id="category_id" name="category_id" className="ap-select" value={formData.category_id} onChange={handleChange} required>
                <option value="" disabled>Select category</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>
            <div className="ap-field ap-field-half">
              <label className="ap-label" htmlFor="price">Price (&#x20B9;)</label>
              <div className="ap-price-wrapper">
                <span className="ap-price-symbol">&#x20B9;</span>
                <input type="number" id="price" name="price" className="ap-input ap-input-price" placeholder="0.00" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Material & Size */}
          <div className="ap-row">
            <div className="ap-field ap-field-half">
              <label className="ap-label" htmlFor="material">Material</label>
              <select id="material" name="material" className="ap-select" value={formData.material} onChange={handleChange} required>
                <option value="" disabled>Select material</option>
                {materials.map((mat) => (<option key={mat} value={mat}>{mat}</option>))}
              </select>
            </div>
            <div className="ap-field ap-field-half">
              <label className="ap-label" htmlFor="size">Size</label>
              <div className="ap-size-wrapper">
                {sizeUnit === 'AS PER CLIENT' ? (
                  <input type="text" id="size" name="size" className="ap-input ap-input-size" value="AS PER CLIENT" readOnly />
                ) : (
                  <input type="number" id="size" name="size" className="ap-input ap-input-size" placeholder="e.g. 18" min="0" value={formData.size} onChange={handleChange} />
                )}
                <select className="ap-size-unit" value={sizeUnit} onChange={(e) => { setSizeUnit(e.target.value); if (e.target.value === 'AS PER CLIENT') setFormData({ ...formData, size: '' }) }}>
                  <option value="INCH">INCH</option>
                  <option value="FEET">FEET</option>
                  <option value="CM">CM</option>
                  <option value="METER">METER</option>
                  <option value="MM">MM</option>
                  <option value="AS PER CLIENT">AS PER CLIENT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="ap-field">
            <label className="ap-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="ap-textarea" placeholder="Detail the craftsmanship, origin story, and spiritual significance of this murti..." rows={5} value={formData.description} onChange={handleChange} />
            <span className="ap-hint">Mention if it's hand-carved or uses specific traditional techniques.</span>
          </div>

          <hr className="ap-divider" />

          {error && <p className="ap-error">{error}</p>}

          {/* Buttons */}
          <div className="ap-buttons">
            <button type="submit" className="ap-btn-add" disabled={loading}>
              {loading ? <ButtonLoader text="Adding..." /> : 'Add Product'}
            </button>
            <button type="button" className="ap-btn-draft" onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button type="button" className="ap-btn-cancel" onClick={() => navigate('/products')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProduct
