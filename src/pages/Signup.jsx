import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { findUserByEmail, saveUser, genId } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import { CITIES } from '../data/seed.js'

export default function Signup() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('buyer')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', city: '', country: 'Kenya' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate(user.role === 'seller' ? '/seller/dashboard' : '/search', { replace: true })
    return null
  }

  function update(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Phone number required'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.city) e.city = 'Please select a city'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (findUserByEmail(form.email)) {
      setErrors({ email: 'An account with this email already exists' })
      return
    }
    setLoading(true)
    setTimeout(() => {
      const newUser = {
        id: genId('user'),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role,
        city: form.city,
        country: form.country,
        avatar: `https://picsum.photos/seed/${genId()}/200/200`,
        createdAt: new Date().toISOString(),
      }
      saveUser(newUser)
      login(newUser)
      setLoading(false)
      navigate(role === 'seller' ? '/seller/dashboard' : '/search', { replace: true })
    }, 500)
  }

  return (
    <div style={{ backgroundImage: `url(${import.meta.env.BASE_URL}get-started-bg.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'right' }}>
          <img src={`${import.meta.env.BASE_URL}saro-logo.png`} alt="SARO" style={{ height: '48px', display: 'inline-block' }} />
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 24px 60px', position: 'relative', zIndex: 1 }}>
        <h2 style={{
          fontFamily: "'Roboto Condensed', sans-serif",
          fontWeight: 700,
          fontSize: '1.3rem',
          textAlign: 'center',
          marginBottom: 28,
          color: 'var(--white)',
        }}>
          Sign up and start browsing properties...
        </h2>

        {/* Role toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {['buyer', 'seller'].map(r => (
            <button
              key={r}
              type="button"
              className={`btn ${role === r ? 'btn-black' : 'btn-outline'}`}
              style={{ minWidth: 100, background: role === r ? 'var(--black)' : 'var(--white)' }}
              onClick={() => setRole(r)}
            >
              {r === 'buyer' ? 'Buyer' : 'Seller'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Aisha Kamau' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
            { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+254 7XX XXX XXX' },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type} placeholder={f.placeholder}
                value={form[f.key]} onChange={e => update(f.key, e.target.value)} />
              {errors[f.key] && <span className="form-error">{errors[f.key]}</span>}
            </div>
          ))}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-select" value={form.city} onChange={e => update('city', e.target.value)}>
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <span className="form-error">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <select className="form-select" value={form.country} onChange={e => update('country', e.target.value)}>
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="At least 6 characters"
              value={form.password} onChange={e => update('password', e.target.value)} />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="Repeat password"
              value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-black btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : `Sign Up as ${role === 'buyer' ? 'Buyer' : 'Seller'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Already have an account? </span>
          <Link to="/login" className="link" style={{ color: 'var(--gold)' }}>Login</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9rem' }}>
          <Link to="/login" className="link" style={{ fontWeight: 700, color: 'var(--gold)' }}>Buyer</Link>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{' | '}</span>
          <Link to="/login" className="link" style={{ fontWeight: 700, color: 'var(--gold)' }}>Seller</Link>
        </div>
      </div>
    </div>
  )
}
