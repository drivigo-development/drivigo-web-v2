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

const About = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold text-primary-800 mb-4">About Us</h1>
    <p className="text-lg">Drivigo is a platform designed to make driving safer and more enjoyable.</p>
  </div>
);

const Contact = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold text-primary-800 mb-4">Contact Us</h1>
    <p className="text-lg">Have questions? Reach out to our team!</p>
    <form className="mt-4">
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email</label>
        <input type="email" className="w-full p-2 border rounded" placeholder="your@email.com" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Message</label>
        <textarea className="w-full p-2 border rounded" rows="4" placeholder="Your message here..."></textarea>
      </div>
      <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
        Send Message
      </button>
    </form>
  </div>
);

const NotFound = () => (
  <div className="container mx-auto p-4 text-center">
    <h1 className="text-3xl font-bold text-primary-800 mb-4">404 - Page Not Found</h1>
    <p className="text-lg mb-4">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-primary-600 hover:underline">Go back to home</a>
  </div>
);

// Navigation component
const Navigation = () => (
  <nav className="bg-gray-800 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <a href="/" className="text-xl font-bold">Drivigo</a>
      <div className="space-x-4">
        <a href="/" className="hover:text-primary-400">Home</a>
        <a href="/about" className="hover:text-primary-400">About</a>
        <a href="/contact" className="hover:text-primary-400">Contact</a>
      </div>
    </div>
  </nav>
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
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/loader" element={<Loader />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/booking" element={<BookingPage />} />
          </Routes>
        </main>
        <Footer/>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
