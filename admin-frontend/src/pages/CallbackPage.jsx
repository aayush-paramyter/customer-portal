import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { exchangeSsoCode, getCrmToken } from '../api/crmClient'

export default function CallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const handledRef = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const err = searchParams.get('error')
    const expectedState = sessionStorage.getItem('ssoState')
    const state = searchParams.get('state')

    if (err) {
      setError(searchParams.get('error_description') || err)
      return undefined
    }
    if (!code) {
      setError('Missing authorization code')
      return undefined
    }
    if (expectedState && state && expectedState !== state) {
      setError('Invalid SSO state')
      return undefined
    }

    // Already signed in from a prior successful exchange (e.g. user refreshed callback URL)
    if (getCrmToken()) {
      navigate('/dashboard', { replace: true })
      return undefined
    }

    if (handledRef.current) {
      return undefined
    }
    handledRef.current = true

    let cancelled = false
    exchangeSsoCode(code)
      .then(() => {
        sessionStorage.removeItem('ssoState')
        if (!cancelled) navigate('/dashboard', { replace: true })
      })
      .catch((e) => {
        handledRef.current = false
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Signing you in…</h1>
        {error ? (
          <>
            <p className="error">{error}</p>
            <Link to="/login">Back to login</Link>
          </>
        ) : (
          <p>Completing Hyegro sign-in.</p>
        )}
      </div>
    </div>
  )
}
