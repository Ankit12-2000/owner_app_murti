import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE, UPLOADS_BASE } from '../config'
import { ButtonLoader } from '../components/Loader'
import Loader from '../components/Loader'
import './AddProduct.css'

function EditProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const token = localStorage.getItem('token')

  const [formData, setFormData] = useState({ name: '', category_id: '', price: '', material: '', size: '', description: '' })
  const [sizeUnit, setSizeUnit] = useState('INCH')
  const [imageFiles, setImageFiles] = useState([null, null, null, null, null])
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null])
  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRefs = useRef([])

  // Fetch product data, categories, materials
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/product/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${API_BASE}/categories`).then((r) => r.json()),
      fetch(`${API_BASE}/product/materials`).then((r) => r.json()),
    ])
      .then(([productRes, catRes, matRes]) => {
        if (productRes.success) {
          const p = productRes.data
          // Parse size and unit
          let sizeVal = p.size || ''
          let unit = 'INCH'
          if (sizeVal.toUpperCase().includes('AS PER CLIENT')) {
            unit = 'AS PER CLIENT'
            sizeVal = ''
          } else {
            const units = ['FEET', 'FT', 'METER', 'MM', 'CM', 'INCH']
            for (const u of units) {
              if (sizeVal.toUpperCase().includes(u)) {
                unit = u === 'FT' ? 'FEET' : u
                sizeVal = sizeVal.toUpperCase().replace(u, '').trim()
                break
              }
            }
          }

          setFormData({
            name: p.name || '',
            category_id: p.category_id || '',
            price: p.price || '',
            material: p.material || '',
            size: sizeVal,
            description: p.description || '',
          })
          setSizeUnit(unit)

          // Load existing images
          if (p.images && p.images.length > 0) {
            setExistingImages(p.images)
            const previews = [null, null, null, null, null]
            p.images.forEach((img, i) => {
              if (i < 5) {
                const url = img.image_url
                previews[i] = url.startsWith('http') ? url : `${UPLOADS_BASE}${url}`
              }
            })
            setImagePreviews(previews)
          } else if (p.image_url) {
            const url = p.image_url.startsWith('http') ? p.image_url : `${UPLOADS_BASE}${p.image_url}`
            setImagePreviews([url, null, null, null, null])
          }
        } else {
          setError('Product not found.')
        }
        if (catRes.success) setCategories(catRes.data)
        if (matRes.success) setMaterials(matRes.data)
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoading(false))
  }, [id])

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
      // If replacing an existing image, mark it for removal
      if (existingImages[index]) {
        setRemovedImageIds((prev) => [...prev, existingImages[index].id])
      }
    }
  }

  const removeImage = (index) => {
    // Mark existing image for removal
    if (existingImages[index]) {
      setRemovedImageIds((prev) => [...prev, existingImages[index].id])
      setExistingImages((prev) => { const c = [...prev]; c[index] = null; return c })
    }
    setImageFiles((prev) => { const c = [...prev]; c[index] = null; return c })
    setImagePreviews((prev) => { const c = [...prev]; c[index] = null; return c })
    if (fileRefs.current[index]) fileRefs.current[index].value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const sizeValue = sizeUnit === 'AS PER CLIENT' ? 'AS PER CLIENT' : (formData.size ? `${formData.size} ${sizeUnit}` : '')

      // Always use FormData — backend expects multipart/form-data on PUT
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('category_id', formData.category_id)
      fd.append('price', formData.price)
      fd.append('material', formData.material)
      fd.append('size', sizeValue)
      fd.append('description', formData.description)
      imageFiles.forEach((file) => { if (file) fd.append('images', file) })
      if (removedImageIds.length > 0) {
        fd.append('removed_images', JSON.stringify(removedImageIds))
      }

      const res = await fetch(`${API_BASE}/product/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (data.success) {
        navigate('/products')
      } else {
        setError(data.message || 'Failed to update product.')
      }
    } catch (err) {
      setError('Server error. Please try again later.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader text="Loading product..." />

  return (
    <div className="ap-page">
      <div className="ap-content">
        <div className="ap-title-row">
          <div>
            <h1 className="ap-title">Edit Product</h1>
            <p className="ap-subtitle">Update the details of your product.</p>
          </div>
        </div>

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
            <button type="submit" className="ap-btn-add" disabled={saving}>
              {saving ? <ButtonLoader text="Saving..." /> : 'Save Changes'}
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

export default EditProduct
