import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="page">
      {/* Hero split */}
      <div className="split-layout" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="split-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <span className="saro-logo lg">SARO</span>
            <span className="saro-tagline" style={{ fontSize: '1rem', marginTop: 6 }}>Real Estate Simplified</span>
          </div>
          <h1 style={{
            fontFamily: "'Roboto Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '2.8rem',
            lineHeight: 1.1,
            color: 'var(--black)',
            marginBottom: 20,
            maxWidth: 460,
          }}>
            Find your perfect property in East Africa
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--black)', opacity: 0.8, marginBottom: 32, maxWidth: 420 }}>
            Browse thousands of verified homes, apartments, and commercial spaces across Kenya. Buy, rent, or list your property with confidence.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/search" className="btn btn-black btn-lg">Browse Listings</Link>
            {!user && <Link to="/signup" className="btn btn-outline btn-lg">Get Started Free</Link>}
          </div>
        </div>

        <div className="split-right" style={{ background: 'var(--white)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: 420 }}>
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: 8 }}>
                Ready to Buy or Rent?
              </h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', marginBottom: 20 }}>
                Search across Nairobi, Mombasa, Kisumu, Nakuru and more.
              </p>
              <Link to="/search" className="btn btn-primary" style={{ marginBottom: 12, display: 'inline-flex' }}>
                Search Properties
              </Link>
            </div>

            <hr className="bold" style={{ marginBottom: 40 }} />

            <div>
              <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: 8 }}>
                Ready to Sell?
              </h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', marginBottom: 20 }}>
                List your property and connect with verified buyers across East Africa.
              </p>
              {!user ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Link to="/signup" className="btn btn-green">List a Property</Link>
                  <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>or</span>
                  <Link to="/login" className="link">Login</Link>
                </div>
              ) : user.role === 'seller' ? (
                <Link to="/seller/dashboard" className="btn btn-green">Go to Dashboard</Link>
              ) : (
                <Link to="/search" className="btn btn-primary">Browse Listings</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* City quick links */}
      <div style={{ background: 'var(--black)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h3 style={{
            fontFamily: "'Roboto Condensed', sans-serif",
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--gold)',
            marginBottom: 20,
          }}>
            Browse by City
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'].map(city => (
              <Link
                key={city}
                to={`/search?city=${city}`}
                className="btn btn-outline"
                style={{ color: 'var(--white)', borderColor: 'var(--white)' }}
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features bar */}
      <div style={{ background: 'var(--gold)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid-3">
            {[
              { icon: '🏠', title: 'Verified Listings', desc: 'Every listing is verified by our team for accuracy and legitimacy.' },
              { icon: '🔍', title: 'Smart Search', desc: 'Filter by city, price, beds, and amenities to find your ideal home.' },
              { icon: '🤝', title: 'Direct Connection', desc: 'Connect directly with sellers and property owners in Kenya.' },
            ].map(f => (
              <div key={f.title} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--black)', opacity: 0.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
