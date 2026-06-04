import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { requestMagicLink, verifyMagicLink } from '../../api/portalApi'

export default function MagicLinkPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [tenantSchema, setTenantSchema] = useState(localStorage.getItem('tenantSchema') || 'tenant_demo')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    const tenant = searchParams.get('tenant') || tenantSchema
    if (!token) return undefined

    let cancelled = false
    setLoading(true)
    verifyMagicLink({ token, tenantSchema: tenant })
      .then(() => {
        if (!cancelled) navigate('/dashboard')
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Invalid magic link')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [navigate, searchParams, tenantSchema])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestMagicLink({ email, tenantSchema })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  // Shared decorative background blurs
  const renderBackground = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div 
        className="absolute top-0 right-0 rounded-full" 
        style={{ 
          width: '800px', 
          height: '800px', 
          backgroundColor: 'var(--color-primary-fixed)', 
          opacity: 0.25, 
          filter: 'blur(120px)', 
          transform: 'translateY(-50%) translateX(33%)',
          position: 'absolute'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 rounded-full" 
        style={{ 
          width: '600px', 
          height: '600px', 
          backgroundColor: 'var(--color-secondary-fixed)', 
          opacity: 0.25, 
          filter: 'blur(100px)', 
          transform: 'translateY(33%) translateX(-25%)',
          position: 'absolute'
        }}
      />
    </div>
  )

  if (loading && searchParams.get('token')) {
    return (
      <div className="auth-shell">
        {renderBackground()}
        <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant p-lg relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-on-primary mb-sm">
            <span className="material-symbols-outlined text-[28px] animate-spin">refresh</span>
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Verifying link</h1>
          <p className="font-body-md text-body-md text-secondary">Checking your magic link credentials, please wait...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      {renderBackground()}

      <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant p-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-on-primary mb-sm">
            <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary mb-xs">Hyegro</h1>
          <p className="font-headline-sm text-headline-sm text-secondary">Sign in with Magic Link</p>
        </div>

        {!sent ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-lg">
            {/* Email Input */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="magic-email">Email Address</label>
              <div className="relative">
                <div 
                  className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                  style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input 
                  id="magic-email" 
                  name="magic-email" 
                  placeholder="name@company.com" 
                  required 
                  type="email" 
                  value={email}
                  className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                  style={{ paddingLeft: '40px', height: '40px' }}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Tenant Schema */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="magic-tenant">Tenant Schema</label>
              <div className="relative">
                <div 
                  className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                  style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-symbols-outlined text-[20px]">layers</span>
                </div>
                <input 
                  id="magic-tenant" 
                  name="magic-tenant" 
                  placeholder="tenant_demo" 
                  type="text" 
                  value={tenantSchema}
                  className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                  style={{ paddingLeft: '40px', height: '40px' }}
                  onChange={(e) => setTenantSchema(e.target.value)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error ? (
              <div className="bg-error-container text-on-error-container p-sm rounded text-xs font-medium">
                {error}
              </div>
            ) : null}

            {/* Action Button */}
            <button 
              className="w-full flex justify-center items-center h-[40px] px-md bg-primary text-on-primary font-label-md text-label-md rounded-[8px] hover:bg-primary-container transition-colors shadow-sm focus:outline-none" 
              disabled={loading} 
              type="submit"
            >
              {loading ? 'Sending…' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-md flex flex-col gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-xs">
              <span className="material-symbols-outlined text-[24px]">done</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface">
              Check your email. A secure sign-in link has been sent to <strong className="font-bold">{email}</strong>.
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-sm border-t border-outline-variant flex justify-center mt-xl">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-xs font-label-md text-label-md text-primary hover:underline group"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform" style={{ verticalAlign: 'middle' }}>arrow_back</span>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
