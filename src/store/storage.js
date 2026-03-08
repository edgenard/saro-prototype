import { SEED_USERS, SEED_LISTINGS } from '../data/seed.js'

const SEED_VERSION = 'v5'

// localStorage keys
export const KEYS = {
  USERS: 'saro_users',
  CURRENT_USER: 'saro_current_user',
  LISTINGS: 'saro_listings',
  SAVED: 'saro_saved',       // { userId: [listingId, ...] }
  INQUIRIES: 'saro_inquiries', // array of inquiry objects
  PREMIUM: 'saro_premium',   // [userId, ...]
  SEEDED: 'saro_seeded',
}

function ensureListingSeedImages(listings) {
  const seedListingsById = new Map(SEED_LISTINGS.map((listing) => [listing.id, listing]))
  const mergedListings = listings.map((listing) => {
    const seededListing = seedListingsById.get(listing.id)
    if (!seededListing) return listing
    return { ...listing, images: seededListing.images }
  })

  const existingIds = new Set(mergedListings.map((listing) => listing.id))
  for (const seededListing of SEED_LISTINGS) {
    if (!existingIds.has(seededListing.id)) mergedListings.push(seededListing)
  }

  return mergedListings
}

export function seedStorage() {
  if (localStorage.getItem(KEYS.SEEDED) === SEED_VERSION) return

  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS))
  }

  if (!localStorage.getItem(KEYS.LISTINGS)) {
    localStorage.setItem(KEYS.LISTINGS, JSON.stringify(SEED_LISTINGS))
  } else {
    const listings = JSON.parse(localStorage.getItem(KEYS.LISTINGS) || '[]')
    localStorage.setItem(KEYS.LISTINGS, JSON.stringify(ensureListingSeedImages(listings)))
  }

  if (!localStorage.getItem(KEYS.SAVED)) {
    localStorage.setItem(KEYS.SAVED, JSON.stringify({}))
  }

  if (!localStorage.getItem(KEYS.INQUIRIES)) {
    localStorage.setItem(KEYS.INQUIRIES, JSON.stringify([]))
  }

  if (!localStorage.getItem(KEYS.PREMIUM)) {
    localStorage.setItem(KEYS.PREMIUM, JSON.stringify([]))
  }

  localStorage.setItem(KEYS.SEEDED, SEED_VERSION)
}

// --- users ---
export function getUsers() {
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]')
}
export function saveUser(user) {
  const users = getUsers()
  const existing = users.findIndex(u => u.id === user.id)
  if (existing >= 0) users[existing] = user
  else users.push(user)
  localStorage.setItem(KEYS.USERS, JSON.stringify(users))
}
export function getUserById(id) {
  return getUsers().find(u => u.id === id) || null
}
export function findUserByEmail(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

// --- current user ---
export function getCurrentUser() {
  const id = localStorage.getItem(KEYS.CURRENT_USER)
  if (!id) return null
  return getUserById(id)
}
export function setCurrentUser(userId) {
  if (userId) localStorage.setItem(KEYS.CURRENT_USER, userId)
  else localStorage.removeItem(KEYS.CURRENT_USER)
}

// --- listings ---
export function getListings() {
  return JSON.parse(localStorage.getItem(KEYS.LISTINGS) || '[]')
}
export function saveListing(listing) {
  const listings = getListings()
  const idx = listings.findIndex(l => l.id === listing.id)
  if (idx >= 0) listings[idx] = listing
  else listings.push(listing)
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings))
}
export function getListingById(id) {
  return getListings().find(l => l.id === id) || null
}
export function deleteListing(id) {
  const listings = getListings().filter(l => l.id !== id)
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings))
}

// --- saved listings ---
export function getSaved(userId) {
  const all = JSON.parse(localStorage.getItem(KEYS.SAVED) || '{}')
  return all[userId] || []
}
export function toggleSaved(userId, listingId) {
  const all = JSON.parse(localStorage.getItem(KEYS.SAVED) || '{}')
  const arr = all[userId] || []
  if (arr.includes(listingId)) {
    all[userId] = arr.filter(id => id !== listingId)
  } else {
    all[userId] = [...arr, listingId]
  }
  localStorage.setItem(KEYS.SAVED, JSON.stringify(all))
  return all[userId]
}

// --- inquiries ---
export function getInquiries() {
  return JSON.parse(localStorage.getItem(KEYS.INQUIRIES) || '[]')
}
export function addInquiry(inquiry) {
  const inquiries = getInquiries()
  inquiries.push({ ...inquiry, id: 'inq_' + Date.now(), createdAt: new Date().toISOString() })
  localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(inquiries))
}
export function updateInquiry(id, patch) {
  const inquiries = getInquiries().map(i => i.id === id ? { ...i, ...patch } : i)
  localStorage.setItem(KEYS.INQUIRIES, JSON.stringify(inquiries))
}
export function getInquiriesByListing(listingId) {
  return getInquiries().filter(i => i.listingId === listingId)
}
export function getInquiriesBySeller(sellerId) {
  const listings = getListings().filter(l => l.sellerId === sellerId).map(l => l.id)
  return getInquiries().filter(i => listings.includes(i.listingId))
}

// --- premium ---
export function isPremium(userId) {
  const list = JSON.parse(localStorage.getItem(KEYS.PREMIUM) || '[]')
  return list.includes(userId)
}
export function setPremium(userId) {
  const list = JSON.parse(localStorage.getItem(KEYS.PREMIUM) || '[]')
  if (!list.includes(userId)) {
    list.push(userId)
    localStorage.setItem(KEYS.PREMIUM, JSON.stringify(list))
  }
}

// --- utils ---
export function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
