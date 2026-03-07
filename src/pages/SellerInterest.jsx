import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListings, getInquiriesBySeller, getInquiriesByListing, updateInquiry } from '../store/storage.js'
import { useAuth } from '../App.jsx'

export default function SellerInterest() {
  const { listingId } = useParams()
  const { user, premium } = useAuth()
  const navigate = useNavigate()

  const [myListings, setMyListings] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [selectedListingId, setSelectedListingId] = useState(listingId || '')

  function load() {
    const listings = getListings().filter(l => l.sellerId === user.id)
    setMyListings(listings)
    if (listingId) {
      setInquiries(getInquiriesByListing(listingId))
    } else {
      setInquiries(getInquiriesBySeller(user.id))
    }
  }

  useEffect(() => { load() }, [user.id, listingId])

  function handleStatus(inqId, status) {
    updateInquiry(inqId, { status })
    load()
  }

  const displayed = selectedListingId
    ? inquiries.filter(i => i.listingId === selectedListingId)
    : inquiries

  const selectedListing = selectedListingId ? myListings.find(l => l.id === selectedListingId) : null

  return (
    <div className="page">
      <div style={{ background: 'var(--gold)', borderBottom: '2px solid var(--black)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 className="section-title" style={{ margin: 0 }}>Buyer Interest</h1>
            {selectedListing && (
              <p style={{ fontSize: '0.88rem', marginTop: 4 }}>{selectedListing.title}</p>
            )}
          </div>
          <button className="btn btn-sm btn-outline" onClick={() => { setSelectedListingId(''); navigate('/seller/interest') }}>
            All Inquiries
          </button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
          {/* Listings sidebar */}
          <div>
            <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: 12 }}>
              Filter by Listing
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className={`btn btn-sm ${!selectedListingId ? 'btn-black' : 'btn-outline'}`}
                onClick={() => { setSelectedListingId(''); navigate('/seller/interest') }}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                All Listings ({inquiries.length})
              </button>
              {myListings.map(l => {
                const count = inquiries.filter(i => i.listingId === l.id).length
                return (
                  <button
                    key={l.id}
                    className={`btn btn-sm ${selectedListingId === l.id ? 'btn-black' : 'btn-outline'}`}
                    onClick={() => { setSelectedListingId(l.id); navigate(`/seller/interest/${l.id}`) }}
                    style={{ justifyContent: 'flex-start', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={l.title}
                  >
                    {l.title.length > 30 ? l.title.slice(0, 28) + '...' : l.title} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Inquiries */}
          <div>
            {displayed.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📬</div>
                <div className="empty-title">No buyer inquiries yet</div>
                <div className="empty-desc">
                  {myListings.length === 0
                    ? 'Add a listing to start receiving buyer inquiries.'
                    : 'Once buyers express interest in your listings, their details will appear here.'}
                </div>
                {myListings.length === 0 && <Link to="/seller/add" className="btn btn-primary">Add Listing</Link>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {displayed.map(inq => {
                  const listing = myListings.find(l => l.id === inq.listingId)
                  return (
                    <div key={inq.id} className="buyer-interest-card" style={{ flexDirection: 'column', gap: 0 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                        <img
                          src={inq.buyerAvatar || `https://picsum.photos/seed/${inq.buyerId}/200/200`}
                          alt={inq.buyerName}
                          className="buyer-avatar"
                          style={{ width: 64, height: 64 }}
                          onError={e => e.target.src = `https://picsum.photos/seed/buyer_${inq.buyerId}/200/200`}
                        />
                        <div style={{ flex: 1 }}>
                          <div className="buyer-name" style={{ fontSize: '1rem' }}>{inq.buyerName}</div>
                          <div className="buyer-meta">
                            {inq.buyerCity && `${inq.buyerCity} · `}
                            {new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {listing && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--blue)', marginBottom: 4 }}>
                              Re: <Link to={`/listing/${listing.id}`} className="link">{listing.title}</Link>
                            </div>
                          )}
                          <span className={`status-chip ${inq.status}`}>{inq.status}</span>
                        </div>
                      </div>

                      {/* Details */}
                      {inq.message && (
                        <div className="buyer-message" style={{ marginBottom: 12 }}>
                          <strong>Message:</strong> {inq.message}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 12 }}>
                        {inq.budget && <span><strong>Budget:</strong> KES {inq.budget}</span>}
                        {inq.timeline && <span><strong>Timeline:</strong> {inq.timeline}</span>}
                      </div>

                      {/* Contact info - premium only */}
                      {premium ? (
                        <div style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 4, padding: '10px 14px', marginBottom: 12, fontSize: '0.85rem' }}>
                          <strong>Contact:</strong> {inq.buyerEmail} · {inq.buyerPhone}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: 12 }}>
                          <Link to="/premium" className="link">Upgrade to Premium</Link> to view buyer contact details directly.
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--gray-200)' }}>
                        <button className="btn btn-sm btn-green" onClick={() => handleStatus(inq.id, 'contacted')}
                          disabled={inq.status === 'contacted'}>
                          Mark Contacted
                        </button>
                        <button className="btn btn-sm btn-outline" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}
                          onClick={() => handleStatus(inq.id, 'followup')}
                          disabled={inq.status === 'followup'}>
                          Follow-up
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => handleStatus(inq.id, 'archived')}
                          disabled={inq.status === 'archived'}>
                          Archive
                        </button>
                        {inq.status !== 'new' && (
                          <button className="btn btn-sm btn-outline" onClick={() => handleStatus(inq.id, 'new')}>
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Seller interest split view (mockup reference) */}
        <div style={{ marginTop: 40, background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
            <div style={{ background: 'var(--gold)', padding: '40px 32px', display: 'flex', alignItems: 'center' }}>
              <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '2.2rem', lineHeight: 1.1 }}>
                Ready to Sell...
              </h2>
            </div>
            <div style={{ padding: '40px 32px', borderLeft: '2px solid var(--black)' }}>
              <ul style={{ paddingLeft: 20, marginBottom: 20, lineHeight: 2 }}>
                <li><strong style={{ textDecoration: 'underline' }}>Gauge Buyer Interest</strong></li>
                <li><strong>Contact Buyer</strong></li>
              </ul>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: 24 }}>
                <Link to="/premium" className="link">Subscribe</Link> to our premium subscription to contact buyer directly and/or make adjustments to your listing/s.
              </p>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.9rem' }}>
                <Link to="/seller/manage" className="link">Return to Listings</Link>
                <span>|</span>
                <Link to="/search" className="link">Start New Search</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
