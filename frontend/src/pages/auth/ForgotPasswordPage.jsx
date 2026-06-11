import { useState } from 'react'
import { Link } from 'react-router-dom'
import PortalBrandMark from '../../components/PortalBrandMark'
import { requestPasswordReset } from '../../api/portalApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset({ email })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Request failed')
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
        <div className="mb-xl">
          <PortalBrandMark subtitle="Reset password" />
        </div>

        {!submitted ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <p className="font-body-md text-body-md text-on-surface-variant text-center mb-xs">
                Enter your email address below and we'll send you a password reset link.
              </p>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="forgot-email">Email Address</label>
              <div className="relative">
                <div 
                  className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                  style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input 
                  id="forgot-email" 
                  name="forgot-email" 
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

            {/* Error Message */}
            {error ? (
              <div className="bg-error-container text-on-error-container p-sm rounded text-xs font-medium">
                {error}
              </div>
            ) : null}

            {/* Submit Button */}
            <button 
              className="w-full flex justify-center items-center h-[40px] px-md bg-primary text-on-primary font-label-md text-label-md rounded-[8px] hover:bg-primary-container transition-colors shadow-sm focus:outline-none" 
              disabled={loading} 
              type="submit"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-md flex flex-col gap-md">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-xs">
              <span className="material-symbols-outlined text-[24px]">done</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface">
              If your account exists under <strong className="font-bold">{email}</strong>, a password reset link has been sent.
            </p>
          </div>
        )}

        {/* Footer Link */}
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
