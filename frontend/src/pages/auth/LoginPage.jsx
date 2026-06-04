import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithPassword } from '../../api/portalApi'
import { isLocalDevHost } from '../../api/portalHost'

export default function LoginPage() {
  const navigate = useNavigate()
  const showTenantField = isLocalDevHost()
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
    tenantSchema: localStorage.getItem('tenantSchema') || 'tenant_demo',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithPassword({
        email: form.email,
        password: form.password,
        tenantSchema: form.tenantSchema || 'tenant_demo',
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
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

      {/* Main Login Card Container */}
      <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant p-lg relative z-10">
        {/* Header Section */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-on-primary mb-sm">
            <span className="material-symbols-outlined text-[28px]">domain</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary mb-xs">Hyegro</h1>
          <h2 className="font-headline-sm text-headline-sm text-secondary">Customer Portal Login</h2>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-lg">
          {/* Email Input */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email Address</label>
            <div className="relative">
              <div 
                className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input 
                id="email" 
                name="email" 
                placeholder="name@company.com" 
                required 
                type="email" 
                value={form.email}
                className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                style={{ paddingLeft: '40px', height: '40px' }}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
              <Link to="/auth/forgot-password" style={{ fontSize: '12px', fontWeight: '500' }}>Forgot password?</Link>
            </div>
            <div className="relative">
              <div 
                className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                style={{ paddingLeft: '40px', paddingRight: '40px', height: '40px' }}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
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

          {showTenantField ? (
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="tenantSchema">
                Tenant Schema (development only)
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                  style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-symbols-outlined text-[20px]">layers</span>
                </div>
                <input
                  id="tenantSchema"
                  name="tenantSchema"
                  placeholder="tenant_demo"
                  type="text"
                  value={form.tenantSchema}
                  className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                  style={{ paddingLeft: '40px', height: '40px' }}
                  onChange={(e) => setForm((s) => ({ ...s, tenantSchema: e.target.value }))}
                />
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {error ? (
            <div className="bg-error-container text-on-error-container p-sm rounded text-xs font-medium">
              {error}
            </div>
          ) : null}

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-sm cursor-pointer font-body-md text-body-md text-on-surface-variant">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                checked={form.remember}
                className="h-[16px] w-[16px] rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest"
                onChange={(e) => setForm((s) => ({ ...s, remember: e.target.checked }))}
              />
              Remember me
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-md">
            <button 
              className="w-full flex justify-center items-center h-[40px] px-md bg-primary text-on-primary font-label-md text-label-md rounded-[8px] hover:bg-primary-container transition-colors shadow-sm focus:outline-none" 
              disabled={loading} 
              type="submit"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>

            {/* Divider */}
            <div className="relative my-sm">
              <div aria-hidden="true" className="absolute inset-0 flex items-center" style={{ position: 'absolute', top: '50%', left: '0', right: '0', borderTop: '1px solid var(--color-outline-variant)' }}></div>
              <div className="relative flex justify-center text-sm" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <span className="px-sm bg-surface-container-lowest font-label-md text-label-md text-outline">OR</span>
              </div>
            </div>

            <button 
              className="w-full flex justify-center items-center h-[40px] px-md bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md rounded-[8px] hover:bg-surface-container-low transition-colors focus:outline-none" 
              type="button"
              onClick={() => navigate('/auth/magic-link')}
            >
              <span className="material-symbols-outlined text-[18px] mr-sm">auto_awesome</span>
              Sign in with Magic Link
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-xl text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Don't have access? <a href="#contact" className="font-medium text-primary hover:underline">Contact your account manager.</a>
          </p>
        </div>
      </div>
    </div>
  )
}
