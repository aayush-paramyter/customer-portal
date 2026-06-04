import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/cases', label: 'Cases', icon: 'support_agent' },
  { to: '/orders', label: 'Orders', icon: 'shopping_cart' },
  { to: '/invoices', label: 'Invoices', icon: 'receipt_long' },
  { to: '/profile', label: 'Profile', icon: 'person' },
  { to: '/security', label: 'Security', icon: 'lock' },
]

export default function PortalLayout({ title, subtitle, breadcrumb, actions, children }) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const onLogout = () => {
    localStorage.removeItem('portalAccessToken')
    localStorage.removeItem('portalRefreshToken')
    navigate('/login')
  }

  const handleNewCaseClick = () => {
    navigate('/cases/new')
  }

  const renderNavLinks = () => (
    <div className="flex flex-col gap-xs flex-grow">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) => 
            `flex items-center gap-md px-md py-sm rounded-xl transition-all ${
              isActive 
                ? 'bg-secondary-container text-on-secondary-container font-bold scale-98' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`
          }
          to={item.to}
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button 
        className="flex items-center gap-md px-md py-sm rounded-xl text-error hover:bg-error-container/20 transition-all mt-md bg-surface-container-lowest border border-outline-variant"
        onClick={onLogout} 
        style={{ cursor: 'pointer', textAlign: 'left', fontWeight: '500', height: 'auto', color: 'var(--color-error)' }}
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        <span>Sign out</span>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Top Navbar */}
      <header className="lg:hidden bg-surface-container-lowest text-primary border-b border-outline-variant shadow-sm flex justify-between items-center w-full px-margin-mobile py-sm h-16 sticky top-0 z-50">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">H</div>
          <span className="font-headline-md text-headline-md font-bold text-primary">Hyegro</span>
        </div>
        <button 
          className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low rounded-lg p-2 transition-all bg-surface-container-lowest border-none cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? 'close' : 'menu'}
        </button>
      </header>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-64 max-w-[80vw] h-full bg-surface border-r border-outline-variant p-md flex flex-col gap-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-lg flex flex-col gap-xs pt-4">
              <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Hyegro</h1>
              <span className="font-label-md text-label-md text-secondary">Customer Portal</span>
            </div>
            
            <button 
              className="bg-primary text-on-primary rounded-lg py-sm px-md mb-md font-label-md text-label-md font-bold w-full flex items-center justify-center gap-xs hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false)
                handleNewCaseClick()
              }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Support Case
            </button>

            {renderNavLinks()}

            <div className="mt-auto pt-md border-t border-outline-variant flex items-center gap-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-md shrink-0">SJ</div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-label-md text-label-md font-bold truncate">Sarah Johnson</span>
                <span className="font-mono-sm text-mono-sm text-secondary truncate text-xs">Enterprise Solutions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="bg-surface text-primary hidden lg:flex flex-col gap-sm p-md h-screen sticky top-0 shrink-0 z-40 w-64 border-r border-outline-variant">
        <div className="mb-xl flex flex-col gap-xs pt-4">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">H</div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Hyegro</h1>
          </div>
          <span className="font-label-md text-label-md text-secondary px-sm">Customer Portal</span>
        </div>

        <button 
          className="bg-primary text-on-primary rounded-lg py-2 px-4 mb-md hover:bg-primary-container transition-colors font-label-md text-label-md font-bold w-full flex items-center justify-center gap-xs shadow-sm cursor-pointer"
          onClick={handleNewCaseClick}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Support Case
        </button>

        {renderNavLinks()}

        <div className="mt-auto pt-md border-t border-outline-variant flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-md shrink-0">SJ</div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-label-md text-label-md font-bold truncate">Sarah Johnson</span>
            <span className="font-mono-sm text-mono-sm text-secondary truncate text-xs">Enterprise Solutions</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Desktop Top App Bar */}
        <div className="hidden md:flex bg-surface-container-lowest border-b border-outline-variant px-margin-desktop py-sm h-16 items-center justify-end sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-sm">
            <button className="text-secondary hover:text-primary p-2 rounded-lg hover:bg-surface-container-low transition-all bg-transparent border-none cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMgmTO649uJjEiXM87KIgh29gLcQit1kcu-jkpewwxXh-CTabuv3rAVSROAQGAFrLjikx9qdfKULk1HP8pzc76RjCMPWTz50OoLCGiIUVLga_xr_wR7R8Tk8WmVnhzpyy93DTHPaR9S5exFckWBNpOXSa0sbTDDivrujUNLoNLw9j5eJvCQIDtvgYjv7OCa80w2hpHctbzcjriRyoPEeaVUBHupS766RMXyHBIioP3QXvC2rlZDJpW0GpNpEm94UywUK9Fn4L5fsr3"/>
            </div>
          </div>
        </div>

        {/* Dynamic Page Body Content */}
        <div className="flex-1 w-full p-margin-mobile md:p-margin-desktop flex flex-col gap-lg max-w-[1440px] mx-auto">
          {/* Page Header (renders on both mobile and desktop) */}
          <div className="flex flex-col gap-xs">
            {breadcrumb && (
              <div className="page-breadcrumb flex items-center gap-xs font-label-md text-label-md text-on-surface-variant mb-xs">
                {Array.isArray(breadcrumb) ? (
                  breadcrumb.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-xs">
                      {idx > 0 && <span className="page-breadcrumb-sep">/</span>}
                      {item.to ? (
                        <Link to={item.to}>{item.label}</Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </span>
                  ))
                ) : (
                  breadcrumb
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h2>
              {actions && <div className="flex items-center gap-sm">{actions}</div>}
            </div>
            {subtitle && <p className="page-subtitle text-body-md text-on-surface-variant mt-xs">{subtitle}</p>}
          </div>

          {children}
        </div>

        {/* Shared B2B Footer */}
        <footer className="bg-surface-container-lowest border-t border-outline-variant w-full py-lg px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md mt-auto z-10">
          <div className="font-label-md text-label-md font-bold text-on-surface">
            © 2024 Hyegro B2B Portal. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-md font-label-md text-label-md text-secondary">
            <a className="hover:text-primary hover:underline transition-opacity duration-200" href="#support">Support</a>
            <a className="hover:text-primary hover:underline transition-opacity duration-200" href="#privacy">Privacy Policy</a>
            <a className="hover:text-primary hover:underline transition-opacity duration-200" href="#terms">Terms of Service</a>
            <a className="hover:text-primary hover:underline transition-opacity duration-200" href="#api">API Docs</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
