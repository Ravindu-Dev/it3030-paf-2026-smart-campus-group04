import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

/**
 * Application entry point.
 *
 * Provider hierarchy:
 * 1. StrictMode — React development warnings
 * 2. BrowserRouter — React Router
 * 3. GoogleOAuthProvider — Google OAuth context (needs Client ID)
 * 4. AuthProvider — Our custom auth context (user state, JWT management)
 * 5. App — The actual application
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
