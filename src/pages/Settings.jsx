import { useState, useRef, useEffect } from 'react'
import LocationPicker from '../components/LocationPicker'
import { API_BASE } from '../config'
import Loader from '../components/Loader'
import './Settings.css'

function Settings() {
  const token = localStorage.getItem('token')

  // Profile
  const [profile, setProfile] = useState({ owner_name: '', email: '', phone: '' })
  const [profilePreview, setProfilePreview] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const profilePhotoRef = useRef(null)

  // Shop
  const [shopData, setShopData] = useState({ name: '', phone: '', address: '', description: '' })
  const [shopLogo, setShopLogo] = useState(null)
  const [shopLogoPreview, setShopLogoPreview] = useState(null)
  const [shopLoading, setShopLoading] = useState(false)
  const [shopMsg, setShopMsg] = useState('')
  const [shopError, setShopError] = useState('')
  const shopLogoRef = useRef(null)

  // Password
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  // Page loading
  const [pageLoading, setPageLoading] = useState(true)

  // Danger
  const [dangerLoading, setDangerLoading] = useState('')
  const [shopActive, setShopActive] = useState(() => {
    const saved = localStorage.getItem('shopActive')
    return saved !== null ? saved === 'true' : true
  })
  const [deactivateReason, setDeactivateReason] = useState('')
  const [showDeactivateForm, setShowDeactivateForm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ── Fetch profile & shop on mount ──
  useEffect(() => {
    if (!token) return

    Promise.all([
      fetch(`${API_BASE}/settings/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          console.log('Profile settings response:', data)
          const p = data.data || data
          if (data.success && p) {
            setProfile({
              owner_name: p.owner_name || '',
              email: p.email || '',
              phone: p.phone || '',
            })
          }
        })
        .catch((err) => console.error('Profile settings fetch error:', err)),

      fetch(`${API_BASE}/settings/shop`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          console.log('Shop settings response:', data)
          const shop = data.data || data.shop || data
          if (data.success && shop && shop.name) {
            setShopData({
              name: shop.name || '',
              phone: shop.phone || '',
              address: shop.address || '',
              description: shop.description || '',
            })
            if (shop.logo) setShopLogoPreview(shop.logo)
            const active = shop.is_active !== undefined ? !!shop.is_active : true
            setShopActive(active)
            localStorage.setItem('shopActive', String(active))
            localStorage.setItem('shop', JSON.stringify(shop))
          }
        })
        .catch((err) => console.error('Shop settings fetch error:', err)),
    ]).finally(() => setPageLoading(false))
  }, [])

  // ── Profile handlers ──
  const handleProfilePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = async () => {
    setProfileLoading(true)
    setProfileMsg('')
    setProfileError('')
    try {
      const res = await fetch(`${API_BASE}/settings/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (data.success) {
        const seller = JSON.parse(localStorage.getItem('seller') || '{}')
        localStorage.setItem('seller', JSON.stringify({ ...seller, ...profile }))
        setProfileMsg('Profile updated successfully!')
      } else {
        setProfileError(data.message || 'Failed to update.')
      }
    } catch {
      setProfileError('Server error.')
    } finally {
      setProfileLoading(false)
    }
  }

  // ── Shop handlers ──
  const handleShopLogo = (e) => {
    const file = e.target.files[0]
    if (file) {
      setShopLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => setShopLogoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removeShopLogo = () => {
    setShopLogo(null)
    setShopLogoPreview(null)
  }

  const saveShop = async () => {
    setShopLoading(true)
    setShopMsg('')
    setShopError('')
    try {
      const fd = new FormData()
      fd.append('name', shopData.name)
      fd.append('address', shopData.address)
      fd.append('description', shopData.description)
      if (shopLogo) fd.append('logo', shopLogo)

      const res = await fetch(`${API_BASE}/settings/shop`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (data.success) {
        const shop = JSON.parse(localStorage.getItem('shop') || '{}')
        const updated = { ...shop, ...shopData }
        if (data.data) Object.assign(updated, data.data)
        localStorage.setItem('shop', JSON.stringify(updated))
        setShopMsg('Shop settings updated!')
      } else {
        setShopError(data.message || 'Failed to update.')
      }
    } catch {
      setShopError('Server error.')
    } finally {
      setShopLoading(false)
    }
  }

  // ── Password handlers ──
  const savePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwMsg('')

    if (passwords.newPass !== passwords.confirm) {
      setPwError('New password and confirm password do not match.')
      return
    }
    if (passwords.newPass.length < 6) {
      setPwError('Password must be at least 6 characters.')
      return
    }

    setPwLoading(true)
    try {
      const res = await fetch(`${API_BASE}/settings/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.newPass,
          confirm_password: passwords.confirm,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPwMsg(data.message || 'Password changed successfully!')
        setPasswords({ current: '', newPass: '', confirm: '' })
      } else {
        setPwError(data.message || 'Failed to update password.')
      }
    } catch {
      setPwError('Server error.')
    } finally {
      setPwLoading(false)
    }
  }

  // ── Danger handlers ──
  const toggleShopActive = async () => {
    if (shopActive && !showDeactivateForm) {
      setShowDeactivateForm(true)
      return
    }
    const action = shopActive ? 'deactivate' : 'activate'
    setDangerLoading('deactivate')
    try {
      const body = shopActive ? { reason: deactivateReason } : {}
      const res = await fetch(`${API_BASE}/settings/shop/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        const newState = !shopActive
        setShopActive(newState)
        localStorage.setItem('shopActive', String(newState))
        setShowDeactivateForm(false)
        setDeactivateReason('')
      }
      alert(data.message || (data.success ? `Shop ${action}d.` : 'Failed.'))
    } catch {
      alert('Server error.')
    } finally {
      setDangerLoading('')
    }
  }

  const deleteAccount = async () => {
    if (!deletePassword) {
      setPwError('Enter your password to delete account.')
      return
    }
    setDangerLoading('delete')
    try {
      const res = await fetch(`${API_BASE}/settings/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.clear()
        window.location.href = '/login'
      } else {
        alert(data.message || 'Failed to delete account.')
      }
    } catch {
      alert('Server error.')
    } finally {
      setDangerLoading('')
    }
  }

  if (pageLoading) {
    return <Loader text="Loading settings..." />
  }

  return (
    <div className="st-page">
      <h1 className="st-title">Account Settings</h1>
      <p className="st-subtitle">Manage your personal profile, shop identity, and security preferences.</p>

      {/* ═══ Profile Settings ═══ */}
      <div className="st-card">
        <div className="st-card-header">
          <div className="st-card-title-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <h2>Profile Settings</h2>
          </div>
          <button className="st-save-btn" onClick={saveProfile} disabled={profileLoading}>
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        {profileMsg && <p className="st-msg">{profileMsg}</p>}
        {profileError && <p className="st-error">{profileError}</p>}

        <div className="st-profile-row">
          <div className="st-avatar-wrap" onClick={() => profilePhotoRef.current?.click()}>
            {profilePreview ? (
              <img src={profilePreview} alt="Profile" className="st-avatar-img" />
            ) : (
              <div className="st-avatar-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
            <div className="st-avatar-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <input ref={profilePhotoRef} type="file" accept="image/*" onChange={handleProfilePhoto} hidden />
          </div>

          <div className="st-profile-fields">
            <div className="st-row">
              <div className="st-field">
                <label>Owner Name</label>
                <input type="text" value={profile.owner_name} onChange={(e) => setProfile({ ...profile, owner_name: e.target.value })} />
              </div>
              <div className="st-field">
                <label>Email Address</label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
            </div>
            <div className="st-field st-field-half">
              <label>Phone Number</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Shop Settings ═══ */}
      <div className="st-card">
        <div className="st-card-header">
          <div className="st-card-title-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h2>Shop Settings</h2>
          </div>
          <button className="st-save-btn" onClick={saveShop} disabled={shopLoading}>
            {shopLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        {shopMsg && <p className="st-msg">{shopMsg}</p>}
        {shopError && <p className="st-error">{shopError}</p>}

        <div className="st-logo-section">
          <div className="st-logo-circle" onClick={() => shopLogoRef.current?.click()}>
            {shopLogoPreview ? (
              <img src={shopLogoPreview} alt="Shop Logo" className="st-logo-img" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4956a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            )}
            <input ref={shopLogoRef} type="file" accept="image/jpeg,image/png" onChange={handleShopLogo} hidden />
          </div>
          <div className="st-logo-info">
            <span className="st-logo-title">Shop Logo</span>
            <span className="st-logo-hint">PNG or JPG up to 5MB. Recommended size 400x400px.</span>
            <div className="st-logo-actions">
              <button className="st-link-btn orange" onClick={() => shopLogoRef.current?.click()}>Upload New</button>
              {shopLogoPreview && <button className="st-link-btn gray" onClick={removeShopLogo}>Remove</button>}
            </div>
          </div>
        </div>

        <div className="st-row">
          <div className="st-field">
            <label>Shop Name</label>
            <input type="text" value={shopData.name} onChange={(e) => setShopData({ ...shopData, name: e.target.value })} />
          </div>
        </div>
        <div className="st-field st-field-half">
          <label>Shop Phone</label>
          <input type="tel" value={shopData.phone} onChange={(e) => setShopData({ ...shopData, phone: e.target.value })} />
        </div>
        <div className="st-field">
          <label>Shop Address</label>
          <LocationPicker value={shopData.address} onChange={(val) => setShopData({ ...shopData, address: val })} />
        </div>
        <div className="st-field">
          <label>Shop Description</label>
          <textarea rows={4} value={shopData.description} onChange={(e) => setShopData({ ...shopData, description: e.target.value })} />
        </div>
      </div>

      {/* ═══ Change Password ═══ */}
      <div className="st-card">
        <div className="st-card-title-row" style={{ marginBottom: 24 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2>Change Password</h2>
        </div>

        <form onSubmit={savePassword}>
          <div className="st-field st-field-half">
            <label>Current Password</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
          </div>
          <div className="st-row">
            <div className="st-field">
              <label>New Password</label>
              <input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} required minLength={6} />
            </div>
            <div className="st-field">
              <label>Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required minLength={6} />
            </div>
          </div>
          {pwError && <p className="st-error">{pwError}</p>}
          {pwMsg && <p className="st-msg">{pwMsg}</p>}
          <button type="submit" className="st-dark-btn" disabled={pwLoading}>
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* ═══ Danger Zone ═══ */}
      <div className="st-card st-danger-card">
        <div className="st-card-title-row st-danger-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2>Danger Zone</h2>
        </div>

        <div className="st-danger-item st-danger-item-col">
          <div className="st-danger-item-top">
            <div>
              <h4>{shopActive ? 'Deactivate Shop' : 'Activate Shop'}</h4>
              <p>{shopActive
                ? 'Temporarily hide your shop and all listings from customers. You can reactivate anytime.'
                : 'Your shop is currently hidden. Activate to make it visible to customers again.'}</p>
            </div>
            {shopActive && !showDeactivateForm && (
              <button className="st-outline-danger-btn" onClick={toggleShopActive}>
                Deactivate Shop
              </button>
            )}
            {!shopActive && (
              <button className="st-activate-btn" onClick={toggleShopActive} disabled={dangerLoading === 'deactivate'}>
                {dangerLoading === 'deactivate' ? 'Processing...' : 'Activate Shop'}
              </button>
            )}
          </div>
          {showDeactivateForm && shopActive && (
            <div className="st-deactivate-form">
              <textarea
                className="st-deactivate-reason"
                placeholder="Reason for deactivation (e.g. Chhuttiyon par hain, 1 hafte baad wapas aayenge)"
                rows={2}
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
              />
              <div className="st-deactivate-actions">
                <button className="st-outline-danger-btn" onClick={toggleShopActive} disabled={dangerLoading === 'deactivate'}>
                  {dangerLoading === 'deactivate' ? 'Processing...' : 'Confirm Deactivate'}
                </button>
                <button className="st-link-btn gray" onClick={() => { setShowDeactivateForm(false); setDeactivateReason('') }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="st-danger-item">
          <div>
            <h4 className="st-red">Delete Account</h4>
            <p>Permanently remove your account, shop data, and history. This action cannot be undone.</p>
          </div>
          {!showDeleteConfirm ? (
            <button className="st-filled-danger-btn" onClick={() => setShowDeleteConfirm(true)}>
              Delete Everything
            </button>
          ) : (
            <div className="st-delete-confirm">
              <input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="st-delete-input"
              />
              <button className="st-filled-danger-btn" onClick={deleteAccount} disabled={dangerLoading === 'delete'}>
                {dangerLoading === 'delete' ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="st-footer">Murti Kala Seller Dashboard v2.4.0 &bull; &copy; 2024 All Rights Reserved</p>
    </div>
  )
}

export default Settings
