import { applyBrandingToDocument, normalizeBranding, storeBranding } from './portalBranding'

const API_BASE = import.meta.env.VITE_PORTAL_API_BASE ?? ''

const BOOTSTRAP_TIMEOUT_MS = 15000

export function getPortalHostname() {
  return window.location.hostname
}

export function portalHostHeaders(extra = {}) {
  const host = getPortalHostname()
  const headers = { 'X-Portal-Origin': window.location.origin, ...extra }
  if (host) headers['X-Portal-Host'] = host
  return headers
}

export function getApiBase() {
  if (API_BASE) return API_BASE.replace(/\/$/, '')
  return ''
}

export function applyBranding(branding, hostname = window.location.hostname) {
  const normalized = normalizeBranding(branding, hostname)
  storeBranding(normalized)
  applyBrandingToDocument(normalized)
  return normalized
}

export async function bootstrapPortalHost() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), BOOTSTRAP_TIMEOUT_MS)

  try {
    const res = await fetch(`${getApiBase()}/api/portal/public/host-context`, {
      headers: portalHostHeaders(),
      signal: controller.signal,
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(payload.detail || 'This portal URL is not configured')
    }
    const ctx = await res.json()
    if (ctx.tenant_schema) {
      localStorage.setItem('tenantSchema', ctx.tenant_schema)
    }
    ctx.custom_branding = applyBranding(ctx.custom_branding, getPortalHostname())
    return ctx
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(
        'Could not reach the customer portal API. Make sure the portal API is running on port 8011, then refresh this page.',
      )
    }
    if (err instanceof TypeError) {
      throw new Error(
        'Could not connect to the customer portal API. Start it with: uvicorn app.main:app --reload --port 8011',
      )
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}
