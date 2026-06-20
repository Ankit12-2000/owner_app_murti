import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config'
import './Signup.css'

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    email: '',
    password: '',
  })
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
      const res = await fetch(`${API_BASE}/seller/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_name: formData.ownerName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (data.success) {
        navigate('/login')
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Server error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      {/* Left Panel */}
      <div className="signup-left">
        <div className="signup-left-overlay" />
        <div className="signup-left-content">
          <div className="brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="brand-name">Murti Kala</span>
          </div>
          <h1 className="signup-headline">
            Empower your<br />
            <span className="highlight">craftsmanship.</span>
          </h1>
          <p className="signup-subtext">
            Join thousands of traditional artisans reaching global collectors. Your journey from studio to the world starts here.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="signup-right">
        <div className="signup-form-wrapper">
          <h2 className="form-title">Create Shop Account</h2>
          <p className="form-subtitle">
            Join our artisan marketplace and start selling your masterpieces today.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="ownerName">Owner Name</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  placeholder="Enter your full name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+91 00000-00000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="example@murtikala.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
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
              <span className="hint">Must be at least 8 characters long.</span>
            </div>

            {error && <p className="signup-error">{error}</p>}

            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="login-link">
            Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Login</a>
          </p>

          <div className="footer-links">
            <a href="/terms">Terms of Service</a>
            <span className="dot">&bull;</span>
            <a href="/privacy">Privacy Policy</a>
            <span className="dot">&bull;</span>
            <a href="/guide">Artisan Guide</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
