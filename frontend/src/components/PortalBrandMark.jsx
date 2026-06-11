import { usePortalBranding } from '../context/PortalBrandingContext'

function BrandIcon({ branding, compact }) {
  const sizeClass = compact ? 'w-8 h-8' : 'w-12 h-12'
  const iconSize = compact ? 'text-[18px]' : 'text-[28px]'

  if (branding.logoUrl) {
    return (
      <img
        alt={`${branding.portalName} logo`}
        className={`${sizeClass} object-contain shrink-0`}
        src={branding.logoUrl}
      />
    )
  }

  const initial = (branding.portalName || 'P').charAt(0).toUpperCase()
  return (
    <div
      className={`${sizeClass} rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0`}
    >
      {compact ? (
        <span className="text-label-md">{initial}</span>
      ) : (
        <span className={`material-symbols-outlined ${iconSize}`}>domain</span>
      )}
    </div>
  )
}

export default function PortalBrandMark({
  compact = false,
  showTagline = true,
  centered = true,
  subtitle = '',
}) {
  const branding = usePortalBranding()

  if (compact) {
    return (
      <div className={centered ? 'text-center' : ''}>
        <div className={`flex items-center gap-sm min-w-0 ${centered ? 'justify-center' : ''}`}>
          <BrandIcon branding={branding} compact />
          <div className="min-w-0">
            <div className="font-headline-sm text-headline-sm font-bold text-primary truncate">
              {branding.portalName}
            </div>
            {showTagline && branding.tagline ? (
              <div className="font-label-md text-label-md text-secondary truncate">{branding.tagline}</div>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={centered ? 'text-center' : ''}>
      <div className={`inline-flex items-center justify-center mb-sm ${centered ? 'mx-auto' : ''}`}>
        <BrandIcon branding={branding} compact={false} />
      </div>
      <h1 className="font-display-lg text-display-lg text-primary mb-xs">{branding.portalName}</h1>
      {showTagline && branding.tagline ? (
        <p className="font-headline-sm text-headline-sm text-secondary">{branding.tagline}</p>
      ) : null}
      {subtitle ? (
        <h2 className={`font-headline-sm text-headline-sm text-secondary ${branding.tagline ? 'mt-xs' : ''}`}>
          {subtitle}
        </h2>
      ) : null}
    </div>
  )
}
