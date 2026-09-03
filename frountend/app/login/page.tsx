'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { setTokens } from '@/lib/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.login({ username, password })
      if (res.success && res.data) {
        setTokens(res.data.accessToken, res.data.refreshToken)
        window.location.href = '/'
      } else {
        setError(res.message || 'Login failed')
      }
    } catch (err: unknown) {
      let message = 'Login failed. Please try again.'
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
        if (axiosErr.response?.data?.message) {
          message = axiosErr.response.data.message
        } else if (axiosErr.response?.status === 401) {
          message = 'Invalid username or password.'
        } else if (axiosErr.response?.status === 500) {
          message = 'Server error. Please try again later.'
        } else if (axiosErr.response?.status === undefined) {
          message = 'Cannot connect to server. Is the backend running?'
        }
      } else if (err instanceof Error) {
        message = err.message
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Left: Form Section */}
        <div className="form-section">
          <div className="form-inner">
            {/* Branding */}
            <div className="brand-logo">
              <img
                src="/login-logo.png"
                alt="Sunrice Dental Clinic Logo"
                className="brand-logo-img"
              />
            </div>

            {/* Sign In Heading */}
            <h2 className="form-heading">SIGN IN</h2>

            {/* Error */}
            {error && (
              <div className="error-box">{error}</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Username */}
              <div className="input-group">
                <label className="input-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Action Row */}
              <div className="action-row">
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Image Section */}
        <div className="image-section">
          <img
            src="/nhs.jpg"
            alt="Sunrice Dental Clinic"
          />
          <div className="image-overlay">
            <div className="image-content">
              <h2 className="image-title">Welcome to Sunrice Dental Clinic</h2>
              <p className="image-subtitle">
                Streamline your clinic operations with our comprehensive healthcare management platform.
                Manage appointments, patient records, billing, and dental treatments — all in one place.
              </p>
              <div className="image-features">
                <span className="image-feature">Appointment Scheduling</span>
                <span className="image-feature">Patient Records Management</span>
                <span className="image-feature">Billing &amp; Invoicing</span>
                <span className="image-feature">Treatment Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <p>Sunrise Dental Clinic &copy; {new Date().getFullYear()}</p>
        <p>Developed by <span className="dev-name">Sanuth Newmin Rathnayak</span> From ICBT Nugegoda</p>
      </div>
    </div>
  )
}
