import React, { createContext, useContext, useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { getCurrentUser, setCurrentUser, isPremium } from './store/storage.js'

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import BuyerSearch from './pages/BuyerSearch.jsx'
import ListingDetail from './pages/ListingDetail.jsx'
import SavedListings from './pages/SavedListings.jsx'
import InquiryForm from './pages/InquiryForm.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import AddListing from './pages/AddListing.jsx'
import ManageListings from './pages/ManageListings.jsx'
import SellerInterest from './pages/SellerInterest.jsx'
import PremiumUpsell from './pages/PremiumUpsell.jsx'
import Nav from './components/Nav.jsx'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'seller' ? '/seller/dashboard' : '/search'} replace />
  }
  return children
}

function AppContent() {
  const [user, setUser] = useState(getCurrentUser)
  const [premiumState, setPremiumState] = useState(() => user ? isPremium(user.id) : false)

  function login(u) {
    setCurrentUser(u.id)
    setUser(u)
    setPremiumState(isPremium(u.id))
  }

  function logout() {
    setCurrentUser(null)
    setUser(null)
    setPremiumState(false)
  }

  function refreshPremium() {
    if (user) setPremiumState(isPremium(user.id))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, premium: premiumState, refreshPremium }}>
      <div className="app-root">
        <Nav />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<BuyerSearch />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/saved" element={
              <ProtectedRoute role="buyer"><SavedListings /></ProtectedRoute>
            } />
            <Route path="/inquiry/:id" element={
              <ProtectedRoute role="buyer"><InquiryForm /></ProtectedRoute>
            } />
            <Route path="/seller/dashboard" element={
              <ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>
            } />
            <Route path="/seller/add" element={
              <ProtectedRoute role="seller"><AddListing /></ProtectedRoute>
            } />
            <Route path="/seller/add/:id" element={
              <ProtectedRoute role="seller"><AddListing /></ProtectedRoute>
            } />
            <Route path="/seller/manage" element={
              <ProtectedRoute role="seller"><ManageListings /></ProtectedRoute>
            } />
            <Route path="/seller/interest" element={
              <ProtectedRoute role="seller"><SellerInterest /></ProtectedRoute>
            } />
            <Route path="/seller/interest/:listingId" element={
              <ProtectedRoute role="seller"><SellerInterest /></ProtectedRoute>
            } />
            <Route path="/premium" element={
              <ProtectedRoute><PremiumUpsell /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}
