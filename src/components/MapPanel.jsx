import React, { useRef } from 'react'

function formatPriceBubble(price, listingType) {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`
  return price.toString()
}

// City road layouts for visual variety
const ROAD_LAYERS = {
  Nairobi: [
    { type: 'h', top: '20%' }, { type: 'h', top: '45%' }, { type: 'h', top: '65%' }, { type: 'h', top: '82%' },
    { type: 'v', left: '18%' }, { type: 'v', left: '40%' }, { type: 'v', left: '62%' }, { type: 'v', left: '80%' },
  ],
  Mombasa: [
    { type: 'h', top: '30%' }, { type: 'h', top: '55%' }, { type: 'h', top: '75%' },
    { type: 'v', left: '25%' }, { type: 'v', left: '55%' }, { type: 'v', left: '75%' },
  ],
  Kisumu: [
    { type: 'h', top: '35%' }, { type: 'h', top: '60%' },
    { type: 'v', left: '30%' }, { type: 'v', left: '60%' },
  ],
  Nakuru: [
    { type: 'h', top: '30%' }, { type: 'h', top: '60%' },
    { type: 'v', left: '35%' }, { type: 'v', left: '65%' },
  ],
}

const CITY_LABELS = {
  Nairobi: [
    { text: 'Westlands', x: 28, y: 15 },
    { text: 'Kilimani', x: 44, y: 45 },
    { text: 'Karen', x: 12, y: 62 },
    { text: 'Lavington', x: 20, y: 44 },
    { text: 'Ngara', x: 54, y: 22 },
    { text: 'CBD', x: 45, y: 28 },
  ],
  Mombasa: [
    { text: 'Nyali', x: 38, y: 18 },
    { text: 'Diani', x: 28, y: 58 },
    { text: 'CBD', x: 54, y: 48 },
  ],
  Kisumu: [
    { text: 'Milimani', x: 33, y: 38 },
    { text: 'Riat Hills', x: 48, y: 43 },
    { text: 'Lake Victoria', x: 20, y: 65 },
  ],
  Nakuru: [
    { text: 'Town Centre', x: 35, y: 30 },
    { text: 'Milimani', x: 52, y: 35 },
  ],
}

export default function MapPanel({ listings, activeId, onMarkerClick, city }) {
  const roads = ROAD_LAYERS[city] || ROAD_LAYERS.Nairobi
  const labels = CITY_LABELS[city] || []

  return (
    <div className="map-panel" style={{ height: '100%', minHeight: 400 }}>
      <div className="map-grid" />

      {/* Roads */}
      {roads.map((r, i) =>
        r.type === 'h'
          ? <div key={i} className="map-road-h" style={{ top: r.top }} />
          : <div key={i} className="map-road-v" style={{ left: r.left }} />
      )}

      {/* Area labels */}
      {labels.map((l, i) => (
        <div key={i} className="map-label" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
          {l.text}
        </div>
      ))}

      {/* City name watermark */}
      <div style={{
        position: 'absolute', bottom: 12, left: 16,
        fontFamily: "'Roboto Condensed', sans-serif",
        fontWeight: 700, fontSize: '0.75rem',
        color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: 1,
      }}>
        {city || 'Kenya'} — Map View
      </div>

      {/* Markers */}
      {listings.map(listing => (
        <div
          key={listing.id}
          className={`map-marker ${activeId === listing.id ? 'active' : ''}`}
          style={{ left: `${listing.mapX}%`, top: `${listing.mapY}%` }}
          onClick={() => onMarkerClick(listing.id)}
          title={listing.title}
        >
          <div className="map-marker-bubble">
            {formatPriceBubble(listing.price, listing.listingType)}
            {listing.listingType === 'rent' ? '/mo' : ''}
          </div>
          <div className="map-marker-pin" />
        </div>
      ))}
    </div>
  )
}
