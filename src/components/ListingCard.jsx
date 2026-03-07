import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import { getSaved, toggleSaved } from '../store/storage.js'

function formatPrice(price, listingType) {
  if (price >= 1000000) {
    return `KES ${(price / 1000000).toFixed(1)}M`
  }
  if (price >= 1000) {
    return `KES ${(price / 1000).toFixed(0)}K`
  }
  return `KES ${price.toLocaleString()}`
}

export default function ListingCard({ listing, highlighted, onMouseEnter, onMouseLeave, savedIds, onSaveToggle }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const isSaved = savedIds ? savedIds.includes(listing.id) : false

  function handleSave(e) {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (user.role !== 'buyer') return
    const updated = toggleSaved(user.id, listing.id)
    if (onSaveToggle) onSaveToggle(listing.id, updated)
  }

  const bedsLabel = listing.beds === 0 ? 'Studio' : `${listing.beds} bd`

  return (
    <div
      className={`listing-card ${highlighted ? 'highlighted' : ''}`}
      onClick={() => navigate(`/listing/${listing.id}`)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className={`listing-badge ${listing.listingType}`}>
        {listing.listingType === 'rent' ? 'For Rent' : 'For Sale'}
      </span>

      {user?.role === 'buyer' && (
        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          title={isSaved ? 'Remove from saved' : 'Save listing'}
          aria-label="Save listing"
        >
          {isSaved ? '♥' : '♡'}
        </button>
      )}

      <img
        className="listing-card-img"
        src={listing.images[0]}
        alt={listing.title}
        loading="lazy"
        onError={(e) => { e.target.src = `https://picsum.photos/seed/${listing.id}/800/500` }}
      />

      <div className="listing-card-body">
        <div className="listing-card-type">
          {listing.type} · {listing.neighborhood}
        </div>
        <div className="listing-card-title">{listing.title}</div>
        <div className="listing-card-location">📍 {listing.city}, Kenya</div>
        <div className="listing-card-price">
          {formatPrice(listing.price, listing.listingType)}
          {listing.listingType === 'rent' && <span className="price-sub">/mo</span>}
        </div>
        <div className="listing-card-meta">
          <span>🛏 {bedsLabel}</span>
          <span>🚿 {listing.baths} ba</span>
          {listing.sqft && <span>📐 {listing.sqft.toLocaleString()} ft²</span>}
        </div>
      </div>
    </div>
  )
}
