import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import './App.css'
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Loader from './components/Loader';
import Footer from './components/Footer';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const Signup = lazy(() => import('./pages/Signup'));
const Signin = lazy(() => import('./pages/Signin'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BookingPage = lazy(() => import('./pages/Booking'));
const Admin = lazy(() => import('./pages/Admin'));



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
          <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader /></div>}>
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
          </Suspense>
        </main>
        <Footer/>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
