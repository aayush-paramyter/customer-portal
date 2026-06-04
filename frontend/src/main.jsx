import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { bootstrapPortalHost } from './api/portalHost'

function BootstrapApp() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    bootstrapPortalHost()
      .then(() => setReady(true))
      .catch((err) => setError(err.message || 'Failed to load portal'))
  }, [])

  if (error) {
    return (
      <div className="auth-shell">
        <div className="form-card max-w-[440px] text-center p-lg">
          <span className="material-symbols-outlined text-error text-[48px]">dns</span>
          <h1 className="font-headline-sm text-headline-sm mt-md">Portal unavailable</h1>
          <p className="text-body-md text-on-surface-variant mt-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="auth-shell">
        <span className="material-symbols-outlined spin text-[40px]" style={{ color: 'var(--color-primary)' }}>
          progress_activity
        </span>
      </div>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BootstrapApp />
    </BrowserRouter>
  </StrictMode>,
)
