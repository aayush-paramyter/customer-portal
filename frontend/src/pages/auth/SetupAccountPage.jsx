import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalBrandMark from '../../components/PortalBrandMark'

export default function SetupAccountPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    if (password !== confirm) return
    navigate('/auth/account-setup-success')
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
          <PortalBrandMark subtitle="Set up your account" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-lg">
          {/* Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="setup-password">Password</label>
            <div className="relative">
              <div 
                className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input 
                id="setup-password" 
                name="setup-password" 
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
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="setup-confirm-password">Confirm Password</label>
            <div className="relative">
              <div 
                className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none text-outline"
                style={{ position: 'absolute', top: '0', bottom: '0', left: '12px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined text-[20px]">lock_clock</span>
              </div>
              <input 
                id="setup-confirm-password" 
                name="setup-confirm-password" 
                placeholder="••••••••" 
                required 
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                className="block w-full rounded bg-surface-container-lowest border border-outline-variant font-body-md text-body-md text-on-surface transition-colors"
                style={{ paddingLeft: '40px', height: '40px' }}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>

          {/* Password Match Status */}
          {password && confirm && password !== confirm ? (
            <div className="bg-error-container text-on-error-container p-sm rounded text-xs font-medium">
              Passwords do not match
            </div>
          ) : null}

          {/* Create Account Action */}
          <button 
            className="w-full flex justify-center items-center h-[40px] px-md bg-primary text-on-primary font-label-md text-label-md rounded-[8px] hover:bg-primary-container transition-colors shadow-sm focus:outline-none" 
            disabled={password !== confirm} 
            type="submit"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}
