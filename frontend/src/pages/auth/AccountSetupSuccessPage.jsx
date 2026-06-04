import { Link } from 'react-router-dom'

export default function AccountSetupSuccessPage() {
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

      <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant p-lg relative z-10 text-center">
        {/* Success Icon Block */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container mb-md mx-auto">
          <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>

        <h1 className="font-display-lg text-display-lg text-primary mb-xs">Success!</h1>
        <p className="font-headline-sm text-headline-sm text-secondary mb-md">Account setup successful</p>
        
        <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
          Your customer portal access is now ready. You can now log in to manage your cases, orders, and invoices.
        </p>

        <Link 
          className="w-full flex justify-center items-center h-[40px] px-md bg-primary text-on-primary font-label-md text-label-md rounded-[8px] hover:bg-primary-container transition-colors shadow-sm focus:outline-none" 
          to="/login"
          style={{ textDecoration: 'none' }}
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}
