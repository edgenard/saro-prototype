import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setPremium } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import Modal from '../components/Modal.jsx'

const FEATURES = [
  { icon: '📞', text: 'Unlimited access to and direct contact with potential buyers' },
  { icon: '✉️', text: 'Reach out and contact interested buyers directly' },
  { icon: '🏘️', text: 'Unlimited listings on the platform' },
  { icon: '📊', text: 'Access to market insights and neighbourhood guides for your region' },
  { icon: '⚡', text: 'Priority listing placement in search results' },
  { icon: '🔔', text: 'Instant buyer interest notifications' },
]

export default function PremiumUpsell() {
  const { user, premium, refreshPremium } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState('monthly')
  const [showConfirm, setShowConfirm] = useState(false)
  const [activated, setActivated] = useState(false)

  function handleUpgrade() {
    setShowConfirm(false)
    setPremium(user.id)
    refreshPremium()
    setActivated(true)
    setTimeout(() => {
      navigate(user.role === 'seller' ? '/seller/dashboard' : '/search')
    }, 2000)
  }

  if (premium || activated) {
    return (
      <div className="page" style={{ background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>⭐</div>
          <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '2.2rem', textTransform: 'uppercase', marginBottom: 12 }}>
            Premium Activated!
          </h1>
          <p style={{ fontSize: '1rem', marginBottom: 28, color: 'var(--gray-800)' }}>
            You now have full premium access. Connect directly with buyers, manage unlimited listings, and access market insights.
          </p>
          <div className="premium-badge" style={{ justifyContent: 'center', margin: '0 auto 24px', display: 'inline-flex' }}>
            ⭐ PREMIUM MEMBER
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={user?.role === 'seller' ? '/seller/dashboard' : '/search'} className="btn btn-black btn-lg">
              Go to Dashboard
            </Link>
            <Link to="/seller/interest" className="btn btn-outline btn-lg">View Buyer Interest</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Hero */}
      <div className="premium-hero">
        <div className="premium-badge">⭐ SARO PREMIUM</div>
        <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '2.8rem', textTransform: 'uppercase', marginBottom: 12, lineHeight: 1.1 }}>
          Unlock Premium Access
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: 500, margin: '0 auto', color: 'var(--black)', opacity: 0.8 }}>
          Get direct access to buyers, unlimited listings, and market insights across East Africa.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        {/* Plan toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div className="filter-toggle">
            <button className={`filter-toggle-btn ${plan === 'monthly' ? 'active' : ''}`} onClick={() => setPlan('monthly')}>Monthly</button>
            <button className={`filter-toggle-btn ${plan === 'annual' ? 'active' : ''}`} onClick={() => setPlan('annual')}>Annual (Save 25%)</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Standard */}
          <div className="card">
            <div style={{ background: 'var(--gray-100)', padding: '20px 24px', borderBottom: '2px solid var(--black)' }}>
              <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: 8 }}>
                Standard
              </h2>
              <div className="premium-price">Free</div>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: 20, lineHeight: 2.2, color: 'var(--gray-800)' }}>
                <li>View and/or Edit Listings</li>
                <li>Receive buyer inquiries</li>
                <li>Up to 3 active listings</li>
                <li>Basic buyer interest data</li>
                <li style={{ color: 'var(--gray-400)', textDecoration: 'line-through' }}>Direct buyer contact info</li>
                <li style={{ color: 'var(--gray-400)', textDecoration: 'line-through' }}>Unlimited listings</li>
                <li style={{ color: 'var(--gray-400)', textDecoration: 'line-through' }}>Market insights</li>
              </ul>
            </div>
          </div>

          {/* Premium */}
          <div className="premium-card">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div className="premium-badge" style={{ margin: '0 auto 12px', display: 'inline-flex' }}>⭐ PREMIUM</div>
              <div className="premium-price">
                {plan === 'monthly' ? 'KES 4,999' : 'KES 44,999'}
                <span className="premium-price-sub">/{plan === 'monthly' ? 'month' : 'year'}</span>
              </div>
              {plan === 'annual' && (
                <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem', marginTop: 4 }}>
                  Save KES 14,989/year
                </div>
              )}
            </div>

            <ul style={{ paddingLeft: 20, lineHeight: 2.2, marginBottom: 24 }}>
              {FEATURES.map(f => (
                <li key={f.text} style={{ fontSize: '0.88rem' }}>
                  {f.icon} {f.text}
                </li>
              ))}
            </ul>

            <button className="btn btn-green btn-lg" style={{ width: '100%', fontSize: '1rem' }}
              onClick={() => setShowConfirm(true)}>
              Sign Up for Premium Subscription
            </button>

            <p style={{ fontSize: '0.78rem', color: 'var(--gray-600)', textAlign: 'center', marginTop: 10 }}>
              Cancel anytime. No commitment required.
            </p>
          </div>
        </div>

        {/* Already on standard note */}
        <div style={{ marginTop: 32, background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: 10 }}>
            Standard Subscription Includes:
          </h3>
          <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: '0.9rem' }}>
            <li>View and/or Edit your Listing</li>
            <li>Express interest in Buyers who inquire</li>
          </ul>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 8 }}>
            Upgrade to Premium for unlimited access to and direct contact with potential buyers.
          </p>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Premium Upgrade"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
            <button className="btn btn-green btn-lg" onClick={handleUpgrade}>Confirm Upgrade</button>
          </>
        }
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
          <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: 12 }}>
            Upgrade to SARO Premium
          </h3>
          <div style={{ background: 'var(--gray-100)', border: '2px solid var(--black)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.5rem' }}>
              {plan === 'monthly' ? 'KES 4,999 / month' : 'KES 44,999 / year'}
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)' }}>
            This is a prototype demo. No real payment will be processed. Click Confirm to activate premium features.
          </p>
        </div>
      </Modal>
    </div>
  )
}
