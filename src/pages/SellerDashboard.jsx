import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getListings, getInquiriesBySeller, getSaved, getUsers } from '../store/storage.js'
import { useAuth } from '../App.jsx'

export default function SellerDashboard() {
  const { user, premium } = useAuth()

  const [myListings, setMyListings] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [totalSaved, setTotalSaved] = useState(0)

  useEffect(() => {
    const listings = getListings().filter(l => l.sellerId === user.id)
    setMyListings(listings)
    const inqs = getInquiriesBySeller(user.id)
    setInquiries(inqs)
    // Count how many buyers saved seller's listings
    const users = getUsers().filter(u => u.role === 'buyer')
    let saved = 0
    const myListingIds = listings.map(l => l.id)
    users.forEach(u => {
      const s = JSON.parse(localStorage.getItem('saro_saved') || '{}')
      const userSaved = s[u.id] || []
      saved += userSaved.filter(id => myListingIds.includes(id)).length
    })
    setTotalSaved(saved)
  }, [user.id])

  const published = myListings.filter(l => l.published && !l.archived)
  const drafts = myListings.filter(l => !l.published && !l.archived)
  const recentInqs = inquiries.slice(0, 5)

  return (
    <div className="page">
      <div style={{ background: 'var(--gold)', borderBottom: '2px solid var(--black)', padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title" style={{ margin: 0 }}>Seller Dashboard</h1>
            <p style={{ color: 'var(--black)', opacity: 0.7, marginTop: 4 }}>Welcome back, {user.name.split(' ')[0]}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/seller/add" className="btn btn-black">+ Add New Listing</Link>
            {!premium && <Link to="/premium" className="btn btn-green">Upgrade to Premium</Link>}
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--green)' }}>{published.length}</div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--gray-600)' }}>{drafts.length}</div>
            <div className="stat-label">Draft Listings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--blue)' }}>{inquiries.length}</div>
            <div className="stat-label">Buyer Inquiries</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--gold-dark)' }}>{totalSaved}</div>
            <div className="stat-label">Times Saved</div>
          </div>
        </div>

        <div className="grid-2">
          {/* Recent inquiries */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title" style={{ margin: 0 }}>Recent Buyer Interest</h2>
              <Link to="/seller/interest" className="btn btn-sm btn-primary">View All</Link>
            </div>

            {recentInqs.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">📬</div>
                <div className="empty-title">No inquiries yet</div>
                <div className="empty-desc">When buyers express interest, they'll appear here.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentInqs.map(inq => (
                  <div key={inq.id} className="buyer-interest-card">
                    <img
                      src={inq.buyerAvatar || `https://picsum.photos/seed/${inq.buyerId}/200/200`}
                      alt={inq.buyerName}
                      className="buyer-avatar"
                      onError={e => e.target.src = `https://picsum.photos/seed/${inq.buyerId}/200/200`}
                    />
                    <div className="buyer-info">
                      <div className="buyer-name">{inq.buyerName}</div>
                      <div className="buyer-meta">{inq.buyerCity && `${inq.buyerCity} · `}{new Date(inq.createdAt).toLocaleDateString()}</div>
                      {inq.message && <div className="buyer-message">{inq.message.slice(0, 120)}{inq.message.length > 120 ? '...' : ''}</div>}
                      <div style={{ marginTop: 8 }}>
                        <span className={`status-chip ${inq.status}`}>{inq.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My listings */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="section-title" style={{ margin: 0 }}>Your Listings</h2>
              <Link to="/seller/manage" className="btn btn-sm btn-primary">Manage All</Link>
            </div>

            {myListings.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">🏠</div>
                <div className="empty-title">No listings yet</div>
                <div className="empty-desc">Create your first listing to start receiving buyer inquiries.</div>
                <Link to="/seller/add" className="btn btn-primary">Add First Listing</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myListings.slice(0, 5).map(listing => {
                  const listingInqs = inquiries.filter(i => i.listingId === listing.id)
                  return (
                    <div key={listing.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 12 }}>
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--black)', flexShrink: 0 }}
                        onError={e => e.target.src = `https://picsum.photos/seed/${listing.id}/200/150`}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {listing.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                          {listingInqs.length} inquir{listingInqs.length !== 1 ? 'ies' : 'y'}
                          {' · '}
                          <span style={{ color: listing.published ? 'var(--green)' : 'var(--gray-600)', fontWeight: 600 }}>
                            {listing.published ? '● Active' : '○ Draft'}
                          </span>
                        </div>
                      </div>
                      <Link to={`/listing/${listing.id}`} className="btn btn-sm btn-outline">View</Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Premium upsell banner */}
        {!premium && (
          <div style={{ background: 'var(--black)', color: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 24, marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
                Unlock Premium
              </h3>
              <ul style={{ fontSize: '0.85rem', paddingLeft: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 2 }}>
                <li>Unlimited access to and contact with potential buyers</li>
                <li>Reach out and contact interested buyers directly</li>
                <li>Unlimited listings on the platform</li>
                <li>Access to market insights and neighbourhood guides</li>
              </ul>
            </div>
            <Link to="/premium" className="btn btn-green btn-lg">Sign Up for Premium</Link>
          </div>
        )}
      </div>
    </div>
  )
}
