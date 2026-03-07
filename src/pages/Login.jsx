import React, { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { findUserByEmail } from '../store/storage.js'
import { useAuth } from '../App.jsx'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={user.role === 'seller' ? '/seller/dashboard' : '/search'} replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const found = findUserByEmail(email.trim())
      if (!found || found.password !== password) {
        setError('Invalid email or password. Try buyer@demo.com or seller@demo.com with password demo1234')
        setLoading(false)
        return
      }
      login(found)
      setLoading(false)
      if (from) navigate(from, { replace: true })
      else navigate(found.role === 'seller' ? '/seller/dashboard' : '/search', { replace: true })
    }, 400)
  }

  function demoLogin(role) {
    const email = role === 'buyer' ? 'buyer@demo.com' : 'seller@demo.com'
    const found = findUserByEmail(email)
    if (found) {
      login(found)
      navigate(found.role === 'seller' ? '/seller/dashboard' : '/search', { replace: true })
    }
  }

  return (
    <div className="split-layout">
      <div className="split-left" style={{ justifyContent: 'flex-end', paddingBottom: 60, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          background: 'url(https://picsum.photos/seed/mombasa_skyline/800/600) center/cover',
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.25,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Roboto Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '3rem',
            color: 'var(--black)',
            lineHeight: 1.1,
          }}>
            Ready to Buy or Rent...
          </h2>
        </div>
      </div>

      <div className="split-right">
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="saro-logo">SARO</span>
            <span className="saro-tagline">Real Estate Simplified</span>
          </div>

          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.3rem', textTransform: 'uppercase', textAlign: 'center', marginBottom: 28 }}>
            Login
          </h2>

          {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">User Name / Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: 8, letterSpacing: 2, fontFamily: "'Roboto Condensed', sans-serif" }}
            >
              {loading ? 'Logging in...' : 'ENGAGE'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span className="text-muted text-sm">Don't have an account? </span>
            <Link to="/signup" className="link">Sign Up</Link>
          </div>

          <hr className="divider" style={{ marginTop: 28 }} />

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: 10 }}>Quick demo access:</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-outline btn-sm" onClick={() => demoLogin('buyer')}>Demo Buyer</button>
              <button className="btn btn-outline btn-sm" onClick={() => demoLogin('seller')}>Demo Seller</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
