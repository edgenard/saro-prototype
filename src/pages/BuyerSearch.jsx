import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getListings, getSaved, toggleSaved } from '../store/storage.js'
import { useAuth } from '../App.jsx'
import ListingCard from '../components/ListingCard.jsx'
import MapPanel from '../components/MapPanel.jsx'
import { AMENITY_OPTIONS, PROPERTY_TYPES } from '../data/seed.js'

const NEIGHBORHOODS = {
  Nairobi: ['Westlands', 'Kilimani', 'Karen', 'Lavington', 'Ngara', 'Parklands', 'Gigiri', 'Runda'],
  Mombasa: ['Nyali', 'Diani', 'Mombasa CBD', 'Bamburi', 'Shanzu'],
  Kisumu: ['Milimani', 'Riat Hills', 'Kondele', 'Lolwe'],
  Nakuru: ['Nakuru Town', 'Milimani', 'Section 58', 'Shabab'],
}

export default function BuyerSearch() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [allListings, setAllListings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [listingType, setListingType] = useState('all')
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [neighborhood, setNeighborhood] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [propType, setPropType] = useState('')
  const [pets, setPets] = useState(false)
  const [amenity, setAmenity] = useState('')

  const cardRefs = useRef({})

  useEffect(() => {
    const listings = getListings().filter(l => l.published && !l.archived)
    setAllListings(listings)
    if (user?.role === 'buyer') setSavedIds(getSaved(user.id))
  }, [])

  useEffect(() => {
    applyFilters()
  }, [allListings, listingType, query, city, neighborhood, minPrice, maxPrice, beds, baths, propType, pets, amenity])

  function applyFilters() {
    let results = [...allListings]
    if (listingType !== 'all') results = results.filter(l => l.listingType === listingType)
    if (city) results = results.filter(l => l.city === city)
    if (neighborhood) results = results.filter(l => l.neighborhood === neighborhood)
    if (query.trim()) {
      const q = query.toLowerCase()
      results = results.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.neighborhood.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q)
      )
    }
    if (minPrice) results = results.filter(l => l.price >= Number(minPrice))
    if (maxPrice) results = results.filter(l => l.price <= Number(maxPrice))
    if (beds) results = results.filter(l => l.beds >= Number(beds))
    if (baths) results = results.filter(l => l.baths >= Number(baths))
    if (propType) results = results.filter(l => l.type === propType)
    if (pets) results = results.filter(l => l.pets)
    if (amenity) results = results.filter(l => l.amenities.includes(amenity))
    setFiltered(results)
    setActiveId(null)
  }

  function handleSaveToggle(listingId, updatedList) {
    setSavedIds(updatedList)
  }

  function handleMarkerClick(id) {
    setActiveId(id)
    const el = cardRefs.current[id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handleCardEnter(id) { setActiveId(id) }
  function handleCardLeave() { setActiveId(null) }

  function clearFilters() {
    setListingType('all')
    setQuery('')
    setCity('')
    setNeighborhood('')
    setMinPrice('')
    setMaxPrice('')
    setBeds('')
    setBaths('')
    setPropType('')
    setPets(false)
    setAmenity('')
  }

  const displayCity = city || (filtered[0]?.city) || 'Nairobi'
  const neighborhoods = city ? (NEIGHBORHOODS[city] || []) : []

  return (
    <div className="page">
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-toggle">
          {['all', 'rent', 'sale'].map(t => (
            <button key={t} className={`filter-toggle-btn ${listingType === t ? 'active' : ''}`}
              onClick={() => setListingType(t)}>
              {t === 'all' ? 'All' : t === 'rent' ? 'Rent' : 'Buy'}
            </button>
          ))}
        </div>

        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search city, neighborhood, keyword..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <select className="filter-select" value={city} onChange={e => { setCity(e.target.value); setNeighborhood('') }}>
          <option value="">All Cities</option>
          {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'].map(c => <option key={c}>{c}</option>)}
        </select>

        {city && neighborhoods.length > 0 && (
          <select className="filter-select" value={neighborhood} onChange={e => setNeighborhood(e.target.value)}>
            <option value="">All Areas</option>
            {neighborhoods.map(n => <option key={n}>{n}</option>)}
          </select>
        )}

        <select className="filter-select" value={beds} onChange={e => setBeds(e.target.value)}>
          <option value="">Beds</option>
          <option value="0">Studio</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>

        <select className="filter-select" value={baths} onChange={e => setBaths(e.target.value)}>
          <option value="">Baths</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
        </select>

        <select className="filter-select" value={propType} onChange={e => setPropType(e.target.value)}>
          <option value="">Type</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        <button
          className={`filter-toggle-btn ${pets ? 'active' : ''}`}
          style={{ border: '2px solid var(--black)', borderRadius: 4, background: pets ? 'var(--black)' : 'var(--white)', color: pets ? 'var(--white)' : 'var(--black)', cursor: 'pointer', fontFamily: "'Roboto Condensed', sans-serif", fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', padding: '7px 12px' }}
          onClick={() => setPets(p => !p)}
        >
          🐾 Pets
        </button>

        <button className="btn btn-sm btn-outline" onClick={() => setShowFilters(f => !f)}>
          More ▾
        </button>

        {(city || query || minPrice || maxPrice || beds || baths || propType || pets || amenity || listingType !== 'all') && (
          <button className="btn btn-sm btn-danger" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {/* More filters panel */}
      {showFilters && (
        <div style={{ background: 'var(--white)', borderBottom: '2px solid var(--black)', padding: '16px 20px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ minWidth: 180 }}>
            <label className="form-label">Min Price (KES)</label>
            <input className="form-input" type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          </div>
          <div className="form-group" style={{ minWidth: 180 }}>
            <label className="form-label">Max Price (KES)</label>
            <input className="form-input" type="number" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          <div className="form-group" style={{ minWidth: 200 }}>
            <label className="form-label">Amenity</label>
            <select className="form-select" value={amenity} onChange={e => setAmenity(e.target.value)}>
              <option value="">Any amenity</option>
              {AMENITY_OPTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowFilters(false)}>Apply</button>
        </div>
      )}

      {/* Main layout */}
      <div className="search-layout">
        {/* Listings panel */}
        <div className="search-panel">
          <div className="results-header">
            <span className="results-count">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</span>
            {city && <span className="text-muted text-sm" style={{ fontWeight: 600 }}>{city}</span>}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏘️</div>
              <div className="empty-title">No listings found</div>
              <div className="empty-desc">Try adjusting your filters or searching a different city.</div>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="listings-grid">
              {filtered.map(listing => (
                <div key={listing.id} ref={el => cardRefs.current[listing.id] = el}>
                  <ListingCard
                    listing={listing}
                    highlighted={activeId === listing.id}
                    onMouseEnter={() => handleCardEnter(listing.id)}
                    onMouseLeave={handleCardLeave}
                    savedIds={savedIds}
                    onSaveToggle={handleSaveToggle}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map panel */}
        <div className="map-sticky" style={{ padding: 12 }}>
          <MapPanel
            listings={filtered}
            activeId={activeId}
            onMarkerClick={handleMarkerClick}
            city={displayCity}
          />
        </div>
      </div>
    </div>
  )
}
