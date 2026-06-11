import { footerLabel } from '../api/portalBranding'
import { usePortalBranding } from '../context/PortalBrandingContext'

const footerLinks = [
  { label: 'Support', href: '#support' },
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
]

export default function PortalFooter() {
  const branding = usePortalBranding()

  return (
    <footer className="portal-footer">
      <div className="portal-footer__inner">
        <div aria-hidden="true" className="portal-footer__divider" />

        {branding.tagline ? (
          <p className="portal-footer__tagline">{branding.tagline}</p>
        ) : null}

        <nav aria-label="Footer" className="portal-footer__links">
          {footerLinks.map((link, index) => (
            <span key={link.label} className="portal-footer__link-group">
              {index > 0 ? <span aria-hidden="true" className="portal-footer__sep">·</span> : null}
              <a className="portal-footer__link" href={link.href}>
                {link.label}
              </a>
            </span>
          ))}
        </nav>

        <p className="portal-footer__copyright">{footerLabel(branding)}</p>
      </div>
    </footer>
  )
}
