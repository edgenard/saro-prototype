import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListingById, getListings, getSaved, toggleSaved, getUserById, getInquiriesByListing } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import Modal from '../components/Modal.jsx'
import ListingCard from '../components/ListingCard.jsx'

function formatPrice(price, type) {
  const kes = `KES ${price.toLocaleString()}`
  return type === 'rent' ? `${kes} /mo` : kes
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, premium } = useAuth()

  const [listing, setListing] = useState(null)
  const [imgIdx, setImgIdx] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [seller, setSeller] = useState(null)
  const [similar, setSimilar] = useState([])
  const [inquiryCount, setInquiryCount] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  useEffect(() => {
    const l = getListingById(id)
    if (!l) { navigate('/search'); return }
    setListing(l)
    if (user?.role === 'buyer') setIsSaved(getSaved(user.id).includes(id))
    setSeller(getUserById(l.sellerId))
    const all = getListings().filter(x => x.published && !x.archived && x.id !== id)
    const sim = all.filter(x => x.city === l.city || x.type === l.type).slice(0, 3)
    setSimilar(sim)
    setInquiryCount(getInquiriesByListing(id).length)
  }, [id])

  if (!listing) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>

  function handleSave() {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'buyer') return
    const updated = toggleSaved(user.id, listing.id)
    setIsSaved(updated.includes(listing.id))
  }

  const isSeller = user?.role === 'seller'
  const isBuyer = user?.role === 'buyer'
  const isOwnListing = user?.id === listing.sellerId

  return (
    <div className="page">
      <div style={{ background: 'var(--gold)', borderBottom: '2px solid var(--black)', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-sm btn-outline" onClick={() => navigate(-1)}>← Back</button>
          <span style={{ color: 'var(--black)', fontSize: '0.85rem', fontWeight: 500 }}>
            {listing.city} / {listing.neighborhood}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--gray-800)' }}>
            {inquiryCount} buyer{inquiryCount !== 1 ? 's' : ''} interested
          </span>
        </div>
      </div>

      <div className="detail-layout">
        {/* Left column */}
        <div>
          {/* Gallery */}
          <div className="gallery">
            <img src={listing.images[imgIdx]} alt={listing.title}
              onError={e => e.target.src = `https://picsum.photos/seed/${listing.id}_${imgIdx}/800/500`} />
            {listing.images.length > 1 && (
              <>
                <button className="gallery-nav prev" onClick={() => setImgIdx(i => (i - 1 + listing.images.length) % listing.images.length)}>‹</button>
                <button className="gallery-nav next" onClick={() => setImgIdx(i => (i + 1) % listing.images.length)}>›</button>
                <div className="gallery-counter">{imgIdx + 1} of {listing.images.length}</div>
              </>
            )}
          </div>
          <div className="gallery-thumbs" style={{ marginTop: 10 }}>
            {listing.images.map((img, i) => (
              <img key={i} className={`gallery-thumb ${imgIdx === i ? 'active' : ''}`}
                src={img} alt={`View ${i + 1}`} onClick={() => setImgIdx(i)}
                onError={e => e.target.src = `https://picsum.photos/seed/${listing.id}_t${i}/200/150`}
              />
            ))}
          </div>

          {/* Property details */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.8rem', lineHeight: 1.2, marginBottom: 8 }}>
                  {listing.title}
                </h1>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: 12 }}>
                  📍 {listing.neighborhood}, {listing.city} · Kenya
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 700 }}>
                  {formatPrice(listing.price, listing.listingType)}
                </div>
                <span className={`listing-badge ${listing.listingType}`} style={{ position: 'static', display: 'inline-block', marginTop: 4 }}>
                  {listing.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, margin: '16px 0', padding: '16px 0', borderTop: '2px solid var(--black)', borderBottom: '2px solid var(--black)' }}>
              <span style={{ fontWeight: 700 }}>🛏 {listing.beds === 0 ? 'Studio' : `${listing.beds} Bedrooms`}</span>
              <span style={{ fontWeight: 700 }}>🚿 {listing.baths} Bathrooms</span>
              {listing.sqft && <span style={{ fontWeight: 700 }}>📐 {listing.sqft.toLocaleString()} ft²</span>}
              <span style={{ fontWeight: 700 }}>🐾 Pets: {listing.pets ? 'Yes' : 'No'}</span>
            </div>

            <p style={{ lineHeight: 1.7, color: 'var(--gray-800)', marginBottom: 20 }}>{listing.description}</p>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: 10 }}>
                  Amenities & Features
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {listing.amenities.map(a => <span key={a} className="tag green">{a}</span>)}
                </div>
              </div>
            )}

            {/* CTA actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24, padding: '20px 0', borderTop: '2px solid var(--black)' }}>
              {isBuyer && (
                <>
                  <button
                    className={`btn btn-lg ${isSaved ? 'btn-black' : 'btn-primary'}`}
                    onClick={handleSave}
                  >
                    {isSaved ? '♥ Saved' : '♡ Save Listing'}
                  </button>
                  <Link to={`/inquiry/${listing.id}`} className="btn btn-green btn-lg">
                    Express Interest
                  </Link>
                  <button className="btn btn-blue btn-lg" onClick={() => setShowContactModal(true)}>
                    Contact Seller
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link to="/login" className="btn btn-primary btn-lg">Login to Save</Link>
                  <Link to="/inquiry/${listing.id}" className="btn btn-green btn-lg"
                    onClick={e => { e.preventDefault(); navigate('/login') }}>
                    Express Interest
                  </Link>
                </>
              )}
              {isOwnListing && (
                <Link to={`/seller/add/${listing.id}`} className="btn btn-primary btn-lg">Edit Listing</Link>
              )}
              <Link to="/search" className="btn btn-outline btn-lg">Start New Search</Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Seller card */}
          {seller && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ background: 'var(--gold)', padding: '16px 20px', borderBottom: '2px solid var(--black)' }}>
                <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Listed By
                </h3>
              </div>
              <div className="card-body" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  style={{ width: 60, height: 60, borderRadius: 4, border: '2px solid var(--black)', objectFit: 'cover' }}
                  onError={e => e.target.src = `https://picsum.photos/seed/${seller.id}/200/200`}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{seller.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: 4 }}>{seller.city}, Kenya</div>
                  {premium && isBuyer ? (
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>📞 {seller.phone}</div>
                  ) : isBuyer ? (
                    <Link to="/premium" className="link" style={{ fontSize: '0.82rem' }}>Subscribe to see contact</Link>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Similar listings */}
          {similar.length > 0 && (
            <div>
              <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: 14 }}>
                Similar Properties
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {similar.map(l => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact modal */}
      <Modal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Seller"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowContactModal(false)}>Cancel</button>
            <Link to={`/inquiry/${listing.id}`} className="btn btn-green" onClick={() => setShowContactModal(false)}>
              Submit Inquiry
            </Link>
          </>
        }
      >
        {premium && isBuyer ? (
          <div>
            <p style={{ marginBottom: 16 }}>You have premium access. You can contact this seller directly:</p>
            <div style={{ background: 'var(--gray-100)', padding: 16, borderRadius: 8, border: '2px solid var(--black)' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{seller?.name}</div>
              <div>📞 {seller?.phone}</div>
              <div>✉️ {seller?.email}</div>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: 12 }}>Submit an inquiry to express interest in this property. The seller will be notified.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
              <Link to="/premium" className="link">Subscribe to premium</Link> to contact the seller directly with their phone number and email.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
