import { apiRequest, withTenant } from './client'
import { clearPortalTokens, savePortalTokens } from './portalSession'

export function savePortalSession({ accessToken, refreshToken, tenantSchema }) {
  savePortalTokens({ accessToken, refreshToken })
  if (tenantSchema) {
    localStorage.setItem('tenantSchema', tenantSchema)
  }
}

export function clearPortalSession() {
  clearPortalTokens()
}

export async function fetchPortalProfile() {
  return portalFetch('/api/portal/profile/')
}

export async function updatePortalProfile(body) {
  return portalFetch('/api/portal/profile/', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
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

export async function loginWithPassword({ email, password }) {
  const data = await apiRequest('/api/portal/auth/login', {
    method: 'POST',
    headers: withTenant({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, password }),
  })
  savePortalSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tenantSchema: localStorage.getItem('tenantSchema'),
  })
  return data
}

export async function requestMagicLink({ email }) {
  return apiRequest('/api/portal/auth/magic-link/request', {
    method: 'POST',
    headers: withTenant({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  })
}

export async function verifyMagicLink({ token }) {
  const data = await apiRequest('/api/portal/auth/magic-link/verify', {
    method: 'POST',
    headers: withTenant({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token }),
  })
  savePortalSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tenantSchema: localStorage.getItem('tenantSchema'),
  })
  return data
}

export async function requestPasswordReset({ email }) {
  return apiRequest('/api/portal/auth/password/reset-request', {
    method: 'POST',
    headers: withTenant({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  })
}

export async function confirmPasswordReset({ token, newPassword }) {
  return apiRequest('/api/portal/auth/password/reset', {
    method: 'POST',
    headers: withTenant({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token, new_password: newPassword }),
  })
}
