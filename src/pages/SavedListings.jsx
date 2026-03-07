import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSaved, toggleSaved, getListingById, getInquiries } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import ListingCard from '../components/ListingCard.jsx'

export default function SavedListings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [savedIds, setSavedIds] = useState([])
  const [listings, setListings] = useState([])
  const [inquiredIds, setInquiredIds] = useState([])

  useEffect(() => {
    const ids = getSaved(user.id)
    setSavedIds(ids)
    setListings(ids.map(id => getListingById(id)).filter(Boolean))
    const myInquiries = getInquiries().filter(i => i.buyerId === user.id)
    setInquiredIds(myInquiries.map(i => i.listingId))
  }, [user.id])

  function handleRemove(listingId) {
    const updated = toggleSaved(user.id, listingId)
    setSavedIds(updated)
    setListings(updated.map(id => getListingById(id)).filter(Boolean))
  }

  return (
    <div className="page">
      <div style={{ background: 'var(--gold)', borderBottom: '2px solid var(--black)', padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 className="section-title" style={{ margin: 0 }}>Saved Listings</h1>
          <p className="section-subtitle" style={{ margin: '6px 0 0' }}>
            {listings.length} saved propert{listings.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      <div className="page-content">
        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💾</div>
            <div className="empty-title">No saved listings yet</div>
            <div className="empty-desc">Browse properties and tap the heart icon to save listings you like.</div>
            <Link to="/search" className="btn btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div>
            {listings.map(listing => (
              <div key={listing.id} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  style={{ width: 180, height: 130, objectFit: 'cover', borderRadius: 4, border: '2px solid var(--black)', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  onError={e => e.target.src = `https://picsum.photos/seed/${listing.id}/400/300`}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gray-600)', marginBottom: 4 }}>
                    {listing.type} · {listing.neighborhood}
                  </div>
                  <h3
                    style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', marginBottom: 4, lineHeight: 1.3 }}
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    {listing.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 8 }}>📍 {listing.city}, Kenya</p>
                  <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>
                    KES {listing.price.toLocaleString()}{listing.listingType === 'rent' ? '/mo' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/listing/${listing.id}`} className="btn btn-sm btn-primary">View Details</Link>
                    {!inquiredIds.includes(listing.id) ? (
                      <Link to={`/inquiry/${listing.id}`} className="btn btn-sm btn-green">Express Interest</Link>
                    ) : (
                      <span className="status-chip contacted" style={{ alignSelf: 'center' }}>✓ Inquired</span>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleRemove(listing.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
