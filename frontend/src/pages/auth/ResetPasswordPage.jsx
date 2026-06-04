import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset } from '../../api/portalApi'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [tenantSchema, setTenantSchema] = useState(localStorage.getItem('tenantSchema') || 'tenant_demo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) return
    const token = searchParams.get('token')
    if (!token) {
      setError('Reset token is missing from the link')
      return
    }
    setError('')
    setLoading(true)
    try {
      await confirmPasswordReset({ token, newPassword: password, tenantSchema })
      // On success, redirect to setup success page
      navigate('/auth/account-setup-success')
    } catch (err) {
      setError(err.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      {/* Background Decorative Blur Gradients */}
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

      <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant p-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-on-primary mb-sm">
            <span className="material-symbols-outlined text-[28px]">lock</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary mb-xs">Hyegro</h1>
          <p className="font-headline-sm text-headline-sm text-secondary">Create New Password</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-lg">
          {/* New Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="new-password">New Password</label>
            <div className="relative">
              <div 
                className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input 
                id="new-password" 
                name="new-password" 
                placeholder="••••••••" 
                required 
                type={showPassword ? 'text' : 'password'}
                value={password}
                className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                style={{ paddingLeft: '40px', paddingRight: '40px', height: '40px' }}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 pr-sm flex items-center text-outline hover:text-on-surface transition-colors focus:outline-none"
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '0', 
                  bottom: '0', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="confirm-password">Confirm Password</label>
            <div className="relative">
              <div 
                className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined text-[20px]">lock_clock</span>
              </div>
              <input 
                id="confirm-password" 
                name="confirm-password" 
                placeholder="••••••••" 
                required 
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                style={{ paddingLeft: '40px', paddingRight: '40px', height: '40px' }}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Tenant Schema */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="reset-tenant">Tenant Schema</label>
            <div className="relative">
              <div 
                className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
              <input 
                id="reset-tenant" 
                name="reset-tenant" 
                placeholder="tenant_demo" 
                type="text" 
                value={tenantSchema}
                className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                style={{ paddingLeft: '40px', height: '40px' }}
                onChange={(e) => setTenantSchema(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message & Match Warning */}
          {password && confirmPassword && password !== confirmPassword ? (
            <div className="bg-error-container text-on-error-container p-sm rounded text-xs font-medium">
              Passwords do not match
            </div>
          ) : null}

          {error ? (
            <div className="bg-error-container text-on-error-container p-sm rounded text-xs font-medium">
              {error}
            </div>
          ) : null}

          {/* Reset Action */}
          <button 
            className="w-full flex justify-center items-center h-[40px] px-md bg-primary text-on-primary font-label-md text-label-md rounded-[8px] hover:bg-primary-container transition-colors shadow-sm focus:outline-none" 
            disabled={loading || (password !== confirmPassword)} 
            type="submit"
          >
            {loading ? 'Saving…' : 'Reset Password'}
          </button>
        </form>

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
