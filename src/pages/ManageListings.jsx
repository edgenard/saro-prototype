import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getListings, saveListing, deleteListing, getInquiriesByListing, genId } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import Modal from '../components/Modal.jsx'

export default function ManageListings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [tab, setTab] = useState('active')
  const [deleteTarget, setDeleteTarget] = useState(null)

  function load() {
    const all = getListings().filter(l => l.sellerId === user.id)
    setListings(all)
  }

  useEffect(() => { load() }, [user.id])

  function handleTogglePublish(listing) {
    saveListing({ ...listing, published: !listing.published })
    load()
  }

  function handleArchive(listing) {
    saveListing({ ...listing, archived: !listing.archived })
    load()
  }

  function handleDelete(id) {
    deleteListing(id)
    setDeleteTarget(null)
    load()
  }

  function handleDuplicate(listing) {
    const dup = {
      ...listing,
      id: genId('lst'),
      title: listing.title + ' (Copy)',
      published: false,
      createdAt: new Date().toISOString().split('T')[0],
      mapX: Math.floor(Math.random() * 70) + 10,
      mapY: Math.floor(Math.random() * 70) + 10,
    }
    saveListing(dup)
    load()
  }

  const active = listings.filter(l => l.published && !l.archived)
  const drafts = listings.filter(l => !l.published && !l.archived)
  const archived = listings.filter(l => l.archived)

  const tabs = [
    { key: 'active', label: `Active (${active.length})` },
    { key: 'drafts', label: `Drafts (${drafts.length})` },
    { key: 'archived', label: `Archived (${archived.length})` },
  ]

  const displayed = tab === 'active' ? active : tab === 'drafts' ? drafts : archived

  return (
    <div className="page">
      <div style={{ background: 'var(--gold)', borderBottom: '2px solid var(--black)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 className="section-title" style={{ margin: 0 }}>Manage Listings</h1>
          <Link to="/seller/add" className="btn btn-black">+ Add Listing</Link>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <div className="empty-title">No {tab} listings</div>
            <div className="empty-desc">{tab === 'active' ? 'Publish a draft or add a new listing.' : tab === 'drafts' ? 'Save a listing as draft to see it here.' : 'Archived listings appear here.'}</div>
            {tab !== 'archived' && <Link to="/seller/add" className="btn btn-primary">Add Listing</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayed.map(listing => {
              const inquiries = getInquiriesByListing(listing.id)
              return (
                <div key={listing.id} style={{ background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 0 }}>
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      style={{ width: 200, height: 140, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      onError={e => e.target.src = `https://picsum.photos/seed/${listing.id}/400/300`}
                    />
                    <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', marginBottom: 4 }}
                            onClick={() => navigate(`/listing/${listing.id}`)}>
                            {listing.title}
                          </h3>
                          <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginBottom: 8 }}>
                            📍 {listing.neighborhood}, {listing.city} · KES {listing.price.toLocaleString()}{listing.listingType === 'rent' ? '/mo' : ''}
                          </p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`status-chip ${listing.published ? 'contacted' : 'new'}`}>
                              {listing.published ? '● Published' : '○ Draft'}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-600)' }}>
                              {inquiries.length} interested buyer{inquiries.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--gray-200)', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', background: 'var(--gray-100)' }}>
                    <Link to={`/seller/add/${listing.id}`} className="btn btn-sm btn-primary">Edit</Link>
                    <button className="btn btn-sm btn-outline" onClick={() => handleTogglePublish(listing)}>
                      {listing.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => handleDuplicate(listing)}>Duplicate</button>
                    <Link to={`/seller/interest/${listing.id}`} className="btn btn-sm btn-blue">
                      Buyers ({inquiries.length})
                    </Link>
                    <button className="btn btn-sm btn-outline" onClick={() => handleArchive(listing)}>
                      {listing.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(listing.id)}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Listing"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteTarget)}>Delete Permanently</button>
          </>
        }
      >
        <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
