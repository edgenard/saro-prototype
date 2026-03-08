import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
)

export default function Nav() {
  const { user, logout, premium } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const isBuyer = user?.role === 'buyer'
  const isSeller = user?.role === 'seller'

  function isActive(path) {
    return location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link'
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img src={`${import.meta.env.BASE_URL}saro-logo.png`} alt="SARO" style={{ height: '36px', display: 'block' }} />
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/search" className={isActive('/search')}>Browse</Link>
          <a
            href="https://www.saroconsultancy.com/resourcehub"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resource HUB
          </a>
          {isBuyer && (
            <>
              <Link to="/saved" className={isActive('/saved')}>Saved</Link>
            </>
          )}
          {isSeller && (
            <>
              <Link to="/seller/dashboard" className={isActive('/seller/dashboard')}>Dashboard</Link>
              <Link to="/seller/manage" className={isActive('/seller/manage')}>My Listings</Link>
              <Link to="/seller/interest" className={isActive('/seller/interest')}>Buyer Interest</Link>
              <Link to="/seller/add" className={isActive('/seller/add')}>+ Add Listing</Link>
            </>
          )}
        </div>

        <div className="nav-actions">
          <a href="https://www.linkedin.com/company/saro-consultancy/" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--black)', display: 'flex', alignItems: 'center', opacity: 0.6 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            aria-label="LinkedIn"
          ><LinkedInIcon /></a>
          <a href="http://instagram.com/saro_consultancy/" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--black)', display: 'flex', alignItems: 'center', opacity: 0.6 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            aria-label="Instagram"
          ><InstagramIcon /></a>
          {!user && (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          {user && (
            <>
              {!premium && isSeller && (
                <Link to="/premium" className="btn btn-sm" style={{ background: 'var(--black)', color: 'var(--gold)', border: '2px solid var(--black)' }}>
                  Upgrade
                </Link>
              )}
              <div className="nav-user">
                <span>{user.name.split(' ')[0]}</span>
                <span className={`nav-user-badge ${premium ? 'premium' : ''}`}>
                  {premium ? 'Premium' : user.role}
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
