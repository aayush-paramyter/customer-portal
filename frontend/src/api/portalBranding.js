const BRANDING_STORAGE_KEY = 'portalBranding'

export function deriveHostnameLabel(hostname) {
  const host = (hostname || '').toLowerCase()
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return 'Portal'
  }
  const slug = host.endsWith('.localhost') ? host.slice(0, -'.localhost'.length) : host.split('.')[0]
  if (!slug) return 'Portal'
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function normalizeBranding(raw, hostname = '') {
  const data = raw && typeof raw === 'object' ? raw : {}
  const portalName = String(data.portalName || data.portal_name || '').trim()
  const tagline = String(data.tagline || '').trim()
  const logoUrl = String(data.logoUrl || data.logo_url || '').trim()
  const primaryColor = String(data.primaryColor || data.primary_color || '').trim()
  const footerText = String(data.footerText || data.footer_text || '').trim()
  return {
    portalName: portalName || deriveHostnameLabel(hostname),
    tagline,
    logoUrl,
    primaryColor,
    footerText,
  }
}

export function getStoredBranding(hostname = window.location.hostname) {
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY)
    if (!raw) return normalizeBranding(null, hostname)
    return normalizeBranding(JSON.parse(raw), hostname)
  } catch {
    return normalizeBranding(null, hostname)
  }
}

export function storeBranding(branding) {
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding))
}

export function applyBrandingToDocument(branding) {
  if (!branding) return
  const root = document.documentElement
  if (branding.primaryColor) {
    root.style.setProperty('--color-primary', branding.primaryColor)
  }
  if (branding.logoUrl) {
    root.dataset.portalLogoUrl = branding.logoUrl
  } else {
    delete root.dataset.portalLogoUrl
  }
  const title = branding.tagline
    ? `${branding.portalName} — ${branding.tagline}`
    : branding.portalName
  document.title = title
}

export function footerLabel(branding) {
  if (branding?.footerText) return branding.footerText
  const year = new Date().getFullYear()
  return `© ${year} ${branding?.portalName || 'Portal'}. All rights reserved.`
}
