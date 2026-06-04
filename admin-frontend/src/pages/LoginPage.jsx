import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loginWithCrmCredentials, startHyegroSso } from '../api/crmClient'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(searchParams.get('error_description') || searchParams.get('error') || '')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithCrmCredentials(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="flex flex-col items-center text-center gap-xs">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm mb-xs">
            <span className="material-symbols-outlined text-[28px]">shield_person</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Customer Portal Admin</h1>
          <p className="text-body-md text-on-surface-variant">Sign in with your Hyegro CRM account (portal manager or system admin).</p>
        </div>

        <button 
          className="btn-primary w-full flex items-center justify-center gap-xs" 
          onClick={startHyegroSso} 
          type="button"
          id="sso-signin-btn"
        >
          <span className="material-symbols-outlined text-[20px]">login</span>
          Sign in with Hyegro
        </button>

        <div className="flex items-center gap-sm my-xs">
          <hr className="flex-1 border-t border-outline-variant" />
          <span className="font-label-md text-label-md text-outline">or use credentials</span>
          <hr className="flex-1 border-t border-outline-variant" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label" htmlFor="username">CRM Username (user@tenant)</label>
            <input
              id="username"
              required
              className="form-input"
              value={form.username}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
              placeholder="john@paracloudbusinesssol"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              required
              className="form-input"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            />
          </div>

          {error && (
            <div className="alert-error" role="alert">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <button 
            className="btn-outline w-full flex items-center justify-center gap-xs" 
            disabled={loading} 
            type="submit"
            id="password-signin-btn"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined spin text-[20px]">progress_activity</span>
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">key</span>
                <span>Sign in with email & password</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-xs">
          <span className="font-label-md text-label-md text-outline">
            Use Sign in with Hyegro if you are already logged into the CRM in this browser.
          </span>
        </div>
      </div>
    </div>
  )
}
