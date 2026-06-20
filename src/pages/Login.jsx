import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import { ButtonLoader } from '../components/Loader'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ identity: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/seller/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.identity,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('seller', JSON.stringify(data.data))
        if (data.shop) {
          localStorage.setItem('shop', JSON.stringify(data.shop))
        }

        if (data.has_shop) {
          navigate('/dashboard')
        } else {
          navigate('/create-shop')
        }
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError('Server error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left-overlay" />
        <div className="login-left-content">
          <div className="login-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="login-brand-name">Murti Kala</span>
          </div>
          <h1 className="login-headline">
            Empower your<br />
            <span className="login-highlight">craftsmanship.</span>
          </h1>
          <p className="login-subtext">
            Access your artisan dashboard to manage your handcrafted collection and connect with collectors.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <h2 className="login-title">Seller Login</h2>
          <p className="login-subtitle">
            Welcome back! Please enter your details to access your account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="identity">Phone or Email</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  id="identity"
                  name="identity"
                  placeholder="Enter your phone or email"
                  value={formData.identity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password" className="login-forgot" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <ButtonLoader text="Logging in..." /> : 'Login'}
            </button>
          </form>


          <div className="login-footer-links">
            <a href="/help" onClick={(e) => e.preventDefault()}>Help Center</a>
            <span className="login-dot">&bull;</span>
            <a href="/terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <span className="login-dot">&bull;</span>
            <a href="/privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          </div>

          <p className="login-copyright">
            &copy; 2024 Murti Kala Artisan Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
