import { apiRequest, withTenant } from './client'

export function savePortalSession({ accessToken, refreshToken, tenantSchema }) {
  localStorage.setItem('portalAccessToken', accessToken)
  localStorage.setItem('portalRefreshToken', refreshToken)
  if (tenantSchema) {
    localStorage.setItem('tenantSchema', tenantSchema)
  }
}

export function clearPortalSession() {
  localStorage.removeItem('portalAccessToken')
  localStorage.removeItem('portalRefreshToken')
}

function tenantHeaders(tenantSchema) {
  if (tenantSchema) {
    return { 'Content-Type': 'application/json', 'X-Tenant-Schema': tenantSchema }
  }
  return withTenant({ 'Content-Type': 'application/json' })
}

export function portalFetch(path, options = {}) {
  const token = localStorage.getItem('portalAccessToken')
  const headers = withTenant({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })
  return apiRequest(path, { ...options, headers })
}

export async function loginWithPassword({ email, password, tenantSchema }) {
  const data = await apiRequest('/api/portal/auth/login', {
    method: 'POST',
    headers: tenantHeaders(tenantSchema),
    body: JSON.stringify({ email, password }),
  })
  savePortalSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tenantSchema,
  })
  return data
}

export async function requestMagicLink({ email, tenantSchema }) {
  return apiRequest('/api/portal/auth/magic-link/request', {
    method: 'POST',
    headers: tenantHeaders(tenantSchema),
    body: JSON.stringify({ email }),
  })
}

export async function verifyMagicLink({ token, tenantSchema }) {
  const data = await apiRequest('/api/portal/auth/magic-link/verify', {
    method: 'POST',
    headers: tenantHeaders(tenantSchema),
    body: JSON.stringify({ token }),
  })
  savePortalSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tenantSchema,
  })
  return data
}

export async function requestPasswordReset({ email, tenantSchema }) {
  return apiRequest('/api/portal/auth/password/reset-request', {
    method: 'POST',
    headers: tenantHeaders(tenantSchema),
    body: JSON.stringify({ email }),
  })
}

export async function confirmPasswordReset({ token, newPassword, tenantSchema }) {
  return apiRequest('/api/portal/auth/password/reset', {
    method: 'POST',
    headers: tenantHeaders(tenantSchema),
    body: JSON.stringify({ token, new_password: newPassword }),
  })
}
