import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListingById, saveListing, genId } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import { AMENITY_OPTIONS, PROPERTY_TYPES, CITIES } from '../data/seed.js'

const NEIGHBORHOODS = {
  Nairobi: ['Westlands', 'Kilimani', 'Karen', 'Lavington', 'Ngara', 'Parklands', 'Gigiri', 'Runda', 'Muthaiga', 'Upperhill'],
  Mombasa: ['Nyali', 'Diani', 'Mombasa CBD', 'Bamburi', 'Shanzu', 'Tudor', 'Likoni'],
  Kisumu: ['Milimani', 'Riat Hills', 'Kondele', 'Lolwe', 'Mamboleo'],
  Nakuru: ['Nakuru Town', 'Milimani', 'Section 58', 'Shabab', 'Racecourse'],
  Eldoret: ['Town Centre', 'Elgon View', 'Annex', 'Langas'],
  Thika: ['Town Centre', 'Makongeni', 'Thika Road'],
}

export default function AddListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    neighborhood: '',
    country: 'Kenya',
    type: 'apartment',
    listingType: 'rent',
    price: '',
    beds: '',
    baths: '',
    sqft: '',
    amenities: [],
    pets: false,
    images: ['', '', ''],
    published: false,
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const l = getListingById(id)
      if (l && l.sellerId === user.id) {
        setForm({
          title: l.title,
          description: l.description,
          city: l.city,
          neighborhood: l.neighborhood,
          country: l.country,
          type: l.type,
          listingType: l.listingType,
          price: l.price.toString(),
          beds: l.beds.toString(),
          baths: l.baths.toString(),
          sqft: l.sqft?.toString() || '',
          amenities: l.amenities || [],
          pets: l.pets,
          images: l.images.concat(['', '', '']).slice(0, 3),
          published: l.published,
        })
      } else {
        navigate('/seller/manage')
      }
    }
  }, [id])

  function update(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  function toggleAmenity(a) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Required'
    if (!form.description.trim()) e.description = 'Required'
    if (!form.city) e.city = 'Required'
    if (!form.neighborhood.trim()) e.neighborhood = 'Required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Valid price required'
    if (form.beds === '' || isNaN(Number(form.beds))) e.beds = 'Required'
    if (form.baths === '' || isNaN(Number(form.baths))) e.baths = 'Required'
    return e
  }

  function submit(publish) {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    setTimeout(() => {
      const images = form.images.filter(i => i.trim())
      if (images.length === 0) images.push(`https://picsum.photos/seed/${genId()}/800/500`)

      const listing = {
        id: isEdit ? id : genId('lst'),
        sellerId: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        city: form.city,
        neighborhood: form.neighborhood.trim(),
        country: form.country,
        type: form.type,
        listingType: form.listingType,
        price: Number(form.price),
        beds: Number(form.beds),
        baths: Number(form.baths),
        sqft: form.sqft ? Number(form.sqft) : null,
        amenities: form.amenities,
        pets: form.pets,
        images,
        published: publish,
        archived: false,
        mapX: Math.floor(Math.random() * 70) + 10,
        mapY: Math.floor(Math.random() * 70) + 10,
        createdAt: isEdit ? undefined : new Date().toISOString().split('T')[0],
      }
      if (isEdit) {
        const orig = getListingById(id)
        if (orig) { listing.createdAt = orig.createdAt; listing.mapX = orig.mapX; listing.mapY = orig.mapY }
      }
      saveListing(listing)
      setSaving(false)
      setSaved(true)
      setTimeout(() => navigate('/seller/manage'), 1200)
    }, 500)
  }

  const neighborhoods = NEIGHBORHOODS[form.city] || []

  return (
    <div className="page">
      <div style={{ background: 'var(--gold)', borderBottom: '2px solid var(--black)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-sm btn-outline" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="section-title" style={{ margin: 0 }}>{isEdit ? 'Edit Listing' : 'Add New Listing'}</h1>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 900 }}>
        {saved && <div className="success-banner">✓ Listing {isEdit ? 'updated' : 'created'} successfully! Redirecting...</div>}

        <div style={{ background: 'var(--white)', border: '2px solid var(--black)', borderRadius: 8, padding: 28 }}>
          <h2 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--black)' }}>
            Property Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Listing Title *</label>
              <input className="form-input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. 3-Bedroom Apartment in Westlands" />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" style={{ minHeight: 120 }} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the property in detail..." />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <select className="form-select" value={form.city} onChange={e => { update('city', e.target.value); update('neighborhood', '') }}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Neighborhood *</label>
                {neighborhoods.length > 0 ? (
                  <select className="form-select" value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)}>
                    <option value="">Select neighborhood</option>
                    {neighborhoods.map(n => <option key={n}>{n}</option>)}
                  </select>
                ) : (
                  <input className="form-input" value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="e.g. Westlands" />
                )}
                {errors.neighborhood && <span className="form-error">{errors.neighborhood}</span>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Country</label>
                <select className="form-select" value={form.country} onChange={e => update('country', e.target.value)}>
                  <option>Kenya</option>
                  <option>Uganda</option>
                  <option>Tanzania</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select className="form-select" value={form.type} onChange={e => update('type', e.target.value)}>
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Listing For</label>
                <div className="filter-toggle">
                  {['rent', 'sale'].map(t => (
                    <button key={t} type="button" className={`filter-toggle-btn ${form.listingType === t ? 'active' : ''}`}
                      onClick={() => update('listingType', t)} style={{ flex: 1 }}>
                      {t === 'rent' ? 'Rent' : 'Sale'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price (KES) *</label>
                <input className="form-input" type="number" value={form.price} onChange={e => update('price', e.target.value)}
                  placeholder={form.listingType === 'rent' ? 'Monthly rent' : 'Sale price'} />
                {errors.price && <span className="form-error">{errors.price}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                <label className="form-label">Bedrooms *</label>
                <select className="form-select" value={form.beds} onChange={e => update('beds', e.target.value)}>
                  <option value="">Select</option>
                  <option value="0">Studio</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.beds && <span className="form-error">{errors.beds}</span>}
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                <label className="form-label">Bathrooms *</label>
                <select className="form-select" value={form.baths} onChange={e => update('baths', e.target.value)}>
                  <option value="">Select</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.baths && <span className="form-error">{errors.baths}</span>}
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                <label className="form-label">Size (ft²)</label>
                <input className="form-input" type="number" value={form.sqft} onChange={e => update('sqft', e.target.value)} placeholder="e.g. 1200" />
              </div>
            </div>

            {/* Amenities */}
            <div className="form-group">
              <label className="form-label">Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {AMENITY_OPTIONS.map(a => (
                  <button key={a} type="button"
                    className={`tag ${form.amenities.includes(a) ? 'active' : ''}`}
                    onClick={() => toggleAmenity(a)}
                    style={{ cursor: 'pointer' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.pets} onChange={e => update('pets', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--gold)' }} />
                <span className="form-label" style={{ margin: 0 }}>Pets Allowed</span>
              </label>
            </div>

            {/* Images */}
            <div className="form-group">
              <label className="form-label">Image URLs (up to 3)</label>
              <span className="form-hint">Enter direct image URLs. Leave blank to use placeholder images.</span>
              {form.images.map((img, i) => (
                <input key={i} className="form-input" style={{ marginTop: 8 }} type="url"
                  value={img} onChange={e => {
                    const imgs = [...form.images]
                    imgs[i] = e.target.value
                    update('images', imgs)
                  }}
                  placeholder={`Image ${i + 1} URL (optional)`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '2px solid var(--black)', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-green btn-lg" disabled={saving} onClick={() => submit(true)}>
              {saving ? 'Saving...' : isEdit ? 'Save & Publish' : 'Publish Listing'}
            </button>
            <button type="button" className="btn btn-outline btn-lg" disabled={saving} onClick={() => submit(false)}>
              Save as Draft
            </button>
            <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
