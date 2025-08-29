import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js'); // NOTE the leading slash
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
