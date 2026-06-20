import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { ButtonLoader } from '../components/Loader'
import './CreateShop.css'

function CreateShop() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    specialization: '',
    address: '',
    description: '',
  })
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const seller = JSON.parse(localStorage.getItem('seller') || '{}')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('seller_id', seller.id)
      fd.append('name', formData.shopName)
      fd.append('phone', formData.phone)
      fd.append('address', formData.address)
      fd.append('description', formData.description)
      if (logoFile) fd.append('logo', logoFile)

      const res = await fetch(`${API_BASE}/shops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: fd,
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('shop', JSON.stringify(data.data))
        navigate('/dashboard')
      } else {
        setError(data.message || 'Failed to create shop. Please try again.')
      }
    } catch (err) {
      setError('Server error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = () => {
    localStorage.setItem('shopDraft', JSON.stringify({ ...formData, logo: logoPreview }))
    alert('Draft saved!')
  }

  return (
    <div className="cs-container">
      {/* Left Panel */}
      <div className="cs-left">
        <div className="cs-left-content">
          <div className="cs-brand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="cs-brand-name">MURTI KALA</span>
          </div>

          <h1 className="cs-headline">
            Empowering Artisans, Preserving Heritage
          </h1>

          <p className="cs-subtext">
            Join a global community of master craftsmen. Showcase your divine creations to collectors around the world.
          </p>

          <div className="cs-testimonial">
            <div className="cs-avatars">
              <div className="cs-avatar" style={{ background: '#d4a574' }} />
              <div className="cs-avatar" style={{ background: '#8b6f47' }} />
              <div className="cs-avatar" style={{ background: '#c4956a' }} />
            </div>
            <p className="cs-quote">
              "Murti Kala helped me reach 500+ collectors in my first year." — Rajesh S., Sculptor
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="cs-right">
        <div className="cs-form-wrapper">
          <h2 className="cs-form-title">Create Your Shop</h2>
          <p className="cs-form-subtitle">
            Complete your profile to start listing your handcrafted murtis.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Shop Logo */}
            <div className="cs-field">
              <label className="cs-label">SHOP LOGO</label>
              <div className="cs-logo-upload">
                <div
                  className="cs-logo-circle"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Shop logo" className="cs-logo-img" />
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c4956a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                      <line x1="20" y1="3" x2="20" y2="1" />
                      <line x1="19" y1="2" x2="21" y2="2" />
                    </svg>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleLogoChange}
                  hidden
                />
                <div className="cs-logo-text">
                  <span className="cs-logo-main">UPLOAD A PROFESSIONAL LOGO OR A PHOTO OF YOUR WORKSHOP.</span>
                  <span className="cs-logo-hint">JPG, PNG OR SVG. MAX 5MB.</span>
                </div>
              </div>
            </div>

            {/* Shop Name */}
            <div className="cs-field">
              <label className="cs-label" htmlFor="shopName">SHOP NAME</label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                className="cs-input"
                placeholder="e.g. Swarnima Divine Arts"
                value={formData.shopName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone & Specialization Row */}
            <div className="cs-row">
              <div className="cs-field cs-field-phone">
                <label className="cs-label" htmlFor="phone">PHONE NUMBER</label>
                <div className="cs-phone-wrapper">
                  <span className="cs-phone-prefix">+91</span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="cs-input cs-input-phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="cs-field cs-field-spec">
                <label className="cs-label" htmlFor="specialization">SPECIALIZATION</label>
                <select
                  id="specialization"
                  name="specialization"
                  className="cs-select"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="wood_carving">Wood Carving</option>
                  <option value="stone_sculpture">Stone Sculpture</option>
                  <option value="metal_casting">Metal Casting</option>
                  <option value="clay_modeling">Clay Modeling</option>
                  <option value="marble_work">Marble Work</option>
                  <option value="bronze_casting">Bronze Casting</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="cs-field">
              <label className="cs-label" htmlFor="address">ADDRESS</label>
              <textarea
                id="address"
                name="address"
                className="cs-textarea"
                placeholder="Shop Number, Street, City, State, PIN"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="cs-field">
              <label className="cs-label" htmlFor="description">SHOP DESCRIPTION & STORY</label>
              <textarea
                id="description"
                name="description"
                className="cs-textarea cs-textarea-lg"
                placeholder="Tell your customers about your legacy, the materials you use, and the passion behind your craft..."
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Buttons */}
            {error && <p className="cs-error">{error}</p>}

            <div className="cs-buttons">
              <button type="submit" className="cs-btn-create" disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {loading ? <ButtonLoader text="Creating..." /> : 'Create Shop'}
              </button>
              <button type="button" className="cs-btn-draft" onClick={handleSaveDraft}>
                Save Draft
              </button>
            </div>
          </form>

          <p className="cs-terms">
            By creating a shop, you agree to Murti Kala's{' '}
            <a href="/terms">Seller Terms & Conditions</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateShop
