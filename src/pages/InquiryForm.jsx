import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListingById, getListings, addInquiry, getInquiries } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import ListingCard from '../components/ListingCard.jsx'

const TIMELINES = ['Immediately', 'Within 1 month', '1–3 months', '3–6 months', 'Flexible']

export default function InquiryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, premium } = useAuth()

  const [listing, setListing] = useState(null)
  const [similar, setSimilar] = useState([])
  const [imgIdx, setImgIdx] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyInquired, setAlreadyInquired] = useState(false)

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
    budget: '',
    timeline: '',
    wantPremium: false,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const l = getListingById(id)
    if (!l) { navigate('/search'); return }
    setListing(l)
    const all = getListings().filter(x => x.published && !x.archived && x.id !== id)
    setSimilar(all.filter(x => x.city === l.city || x.type === l.type).slice(0, 2))
    const prev = getInquiries().find(i => i.buyerId === user?.id && i.listingId === id)
    if (prev) setAlreadyInquired(true)
  }, [id])

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.message.trim()) e.message = 'Please write a message'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    addInquiry({
      buyerId: user?.id || 'anonymous',
      buyerName: form.name,
      buyerEmail: form.email,
      buyerPhone: form.phone,
      buyerAvatar: user?.avatar || `https://picsum.photos/seed/${user?.id}/200/200`,
      buyerCity: user?.city || '',
      listingId: id,
      message: form.message,
      budget: form.budget,
      timeline: form.timeline,
      wantPremium: form.wantPremium,
      status: 'new',
    })

    setSubmitted(true)
    if (form.wantPremium && !premium) navigate('/premium')
  }

  if (!listing) return null

  if (alreadyInquired && !submitted) {
    return (
      <div className="page">
        <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div className="success-banner" style={{ justifyContent: 'center' }}>✓ You have already submitted an inquiry for this property.</div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to={`/listing/${id}`} className="btn btn-primary">Return to Listing</Link>
            <Link to="/search" className="btn btn-outline">Start New Search</Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="page">
        <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div className="success-banner" style={{ justifyContent: 'center', fontSize: '1.1rem' }}>
            ✓ Your inquiry has been sent!
          </div>
          <p style={{ margin: '20px 0', color: 'var(--gray-600)' }}>
            The seller will be notified. You'll hear back via email at {form.email}.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/listing/${id}`} className="btn btn-primary">Return to Listing</Link>
            <Link to="/saved" className="btn btn-outline">View Saved Listings</Link>
            <Link to="/search" className="btn btn-outline">Start New Search</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ background: 'var(--gold)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Left: listing + form */}
          <div>
            {/* Mini gallery */}
            <div style={{ background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, overflow: 'hidden', position: 'relative', marginBottom: 20 }}>
              <img
                src={listing.images[imgIdx]}
                alt={listing.title}
                style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
                onError={e => e.target.src = `https://picsum.photos/seed/${listing.id}_${imgIdx}/800/500`}
              />
              {listing.images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={() => setImgIdx(i => (i - 1 + listing.images.length) % listing.images.length)}>‹</button>
                  <button className="gallery-nav next" onClick={() => setImgIdx(i => (i + 1) % listing.images.length)}>›</button>
                  <div className="gallery-counter">{imgIdx + 1} of {listing.images.length}</div>
                </>
              )}
            </div>

            <div style={{ background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 20 }}>
              <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>{listing.title}</h2>
              <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                {listing.beds > 0 && <li>{listing.beds} Bedroom / {listing.baths} Bath</li>}
                {listing.amenities.slice(0, 3).map(a => <li key={a}>{a}</li>)}
              </ul>
              <div style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1.2rem' }}>
                KES {listing.price.toLocaleString()}{listing.listingType === 'rent' ? '/mo' : ''}
              </div>
            </div>

            {/* Inquiry form */}
            <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 24, marginTop: 16 }}>
              <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: 16 }}>
                Express Interest
              </h3>
              {[
                { k: 'name', label: 'Name', type: 'text' },
                { k: 'email', label: 'Email', type: 'email' },
                { k: 'phone', label: 'Phone', type: 'tel' },
              ].map(f => (
                <div className="form-group" key={f.k} style={{ marginBottom: 14 }}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} value={form[f.k]} onChange={e => update(f.k, e.target.value)} />
                  {errors[f.k] && <span className="form-error">{errors[f.k]}</span>}
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Message</label>
                <textarea className="form-textarea" value={form.message}
                  onChange={e => update('message', e.target.value)}
                  placeholder="Introduce yourself and explain your interest..." />
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>
              <div className="grid-2" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Budget (KES)</label>
                  <input className="form-input" type="text" value={form.budget} onChange={e => update('budget', e.target.value)} placeholder="e.g. 5,000,000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Move-in Timeline</label>
                  <select className="form-select" value={form.timeline} onChange={e => update('timeline', e.target.value)}>
                    <option value="">Select</option>
                    {TIMELINES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {!premium && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={form.wantPremium} onChange={e => update('wantPremium', e.target.checked)}
                    style={{ marginTop: 3, accentColor: 'var(--gold)', width: 16, height: 16 }} />
                  <span>Check to express interest or subscribe to premium to contact seller directly and/or offer a quote.</span>
                </label>
              )}

              <button type="submit" className="btn btn-green btn-lg" style={{ width: '100%' }}>Submit</button>
            </form>
          </div>

          {/* Right: seller profiles + similar */}
          <div>
            <div style={{ background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: 14 }}>
                Ready to Buy or Rent...
              </h3>
              <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                <li style={{ marginBottom: 8 }}>
                  <strong style={{ textDecoration: 'underline' }}>Express Interest</strong>
                </li>
                <li style={{ marginBottom: 8 }}>Contact Seller</li>
                <li>Inquire Further</li>
              </ul>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                <Link to="/premium" className="link">Subscribe</Link> to our premium subscription to contact the seller directly and/or inquire further.
              </p>
              <hr className="divider" />
              <div style={{ display: 'flex', gap: 12, fontSize: '0.85rem' }}>
                <Link to="/search" className="link">Return to Listings</Link>
                <span>|</span>
                <Link to="/search" className="link">Start New Search</Link>
              </div>
            </div>

            {similar.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: 12 }}>
                  Check out these listings similar to your criteria...
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {similar.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
