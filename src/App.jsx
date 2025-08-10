import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import './App.css'
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import AuthCallback from './pages/AuthCallback';

// Page components
import Home from './pages/Home';
import Profile from './pages/Profile';
import Loader from './components/Loader';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/Booking';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Admin from './pages/Admin';



const NotFound = () => (
  <div className="container mx-auto p-4 text-center">
    <h1 className="text-3xl font-bold text-primary-800 mb-4">404 - Page Not Found</h1>
    <p className="text-lg mb-4">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-primary-600 hover:underline">Go back to home</a>
  </div>
);


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar/>
        <Toaster position="top-center" toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#4caf50',
            },
          },
          error: {
            style: {
              background: '#f44336',
            },
          },
        }} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/loader" element={<Loader />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer/>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
