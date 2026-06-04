const API_BASE = import.meta.env.VITE_PORTAL_API_BASE ?? ''

export function isLocalDevHost() {
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

export function getApiBase() {
  if (API_BASE) return API_BASE
  return isLocalDevHost() ? 'http://localhost:8011' : ''
}

export function applyBranding(branding) {
  if (!branding || typeof branding !== 'object') return
  const root = document.documentElement
  if (branding.primaryColor) {
    root.style.setProperty('--color-primary', branding.primaryColor)
  }
  if (branding.logoUrl) {
    root.dataset.portalLogoUrl = branding.logoUrl
  }
}

export async function bootstrapPortalHost() {
  if (isLocalDevHost()) {
    const schema = localStorage.getItem('tenantSchema') || 'tenant_demo'
    localStorage.setItem('tenantSchema', schema)
    return {
      tenant_schema: schema,
      tenant_resolved_from_host: false,
      auth_method: 'both',
    }
  }

  const res = await fetch(`${getApiBase()}/api/portal/public/host-context`)
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.detail || 'This portal URL is not configured')
  }
  const ctx = await res.json()
  if (ctx.tenant_schema) {
    localStorage.setItem('tenantSchema', ctx.tenant_schema)
  }
  applyBranding(ctx.custom_branding)
  return ctx
}
