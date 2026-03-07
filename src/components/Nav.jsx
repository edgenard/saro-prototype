import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App.jsx'

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
            <span className="saro-logo sm">SARO</span>
            <span className="saro-tagline">Real Estate Simplified</span>
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/search" className={isActive('/search')}>Browse</Link>
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
