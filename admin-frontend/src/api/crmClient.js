const CRM_BASE = import.meta.env.VITE_CRM_API_BASE || 'http://localhost:8000'
const CALLBACK_URL = import.meta.env.VITE_ADMIN_CALLBACK_URL || 'http://localhost:5174/callback'

export function getCrmToken() {
  return localStorage.getItem('crmAccessToken')
}

export function saveCrmSession({ accessToken, user, schema, permissions }) {
  localStorage.setItem('crmAccessToken', accessToken)
  if (user) localStorage.setItem('crmUser', JSON.stringify(user))
  if (schema) localStorage.setItem('crmSchema', schema)
  if (permissions) localStorage.setItem('crmPortalPermissions', JSON.stringify(permissions))
}

export function clearCrmSession() {
  localStorage.removeItem('crmAccessToken')
  localStorage.removeItem('crmUser')
  localStorage.removeItem('crmSchema')
  localStorage.removeItem('crmPortalPermissions')
}

export async function crmRequest(path, options = {}) {
  const token = getCrmToken()
  const response = await fetch(`${CRM_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const detail = payload.detail
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail) || `Request failed: ${response.status}`
    throw new Error(message)
  }
  if (response.status === 204) return null
  return response.json()
}

export async function crmBlobRequest(path, options = {}) {
  const token = getCrmToken()
  const response = await fetch(`${CRM_BASE}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const detail = payload.detail
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail) || `Request failed: ${response.status}`
    throw new Error(message)
  }
  return response.blob()
}

export function documentHtmlPath(type, id) {
  if (type === 'invoice') return `/api/portal-admin/invoices/${id}/html`
  if (type === 'order') return `/api/portal-admin/orders/${id}/html`
  return null
}

export async function fetchDocumentHtml(type, id) {
  const path = documentHtmlPath(type, id)
  if (!path) return null
  const token = getCrmToken()
  const response = await fetch(`${CRM_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const detail = payload.detail
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail) || `Request failed: ${response.status}`
    throw new Error(message)
  }
  return response.text()
}

export function documentPdfPath(type, id, disposition = 'inline') {
  if (type === 'invoice') return `/api/portal-admin/invoices/${id}/pdf?disposition=${disposition}`
  if (type === 'order') return `/api/portal-admin/orders/${id}/pdf?disposition=${disposition}`
  if (type === 'attachment') return `/api/portal-admin/attachments/${id}/preview?disposition=${disposition}`
  throw new Error(`Unknown document type: ${type}`)
}

export async function fetchDocumentBlob(type, id, disposition = 'inline') {
  return crmBlobRequest(documentPdfPath(type, id, disposition))
}

export async function downloadDocument(type, id, filename) {
  const blob = await fetchDocumentBlob(type, id, 'attachment')
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function fetchCaseDetail(caseId) {
  return crmRequest(`/api/portal-admin/cases/${caseId}`)
}

export function startHyegroSso() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('ssoState', state)
  const redirectUri = encodeURIComponent(CALLBACK_URL)
  window.location.href = `${CRM_BASE}/api/portal-sso/authorize?redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}`
}

/** Dedupe exchange calls (React StrictMode runs effects twice in dev). */
let ssoExchangeInflight = null

export async function exchangeSsoCode(code) {
  if (ssoExchangeInflight?.code === code) {
    return ssoExchangeInflight.promise
  }

  const promise = (async () => {
    const data = await crmRequest('/api/portal-sso/exchange', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
    saveCrmSession({
      accessToken: data.access_token,
      user: data.user,
      schema: data.schema,
      permissions: data.permissions,
    })
    return data
  })()

  ssoExchangeInflight = { code, promise }
  try {
    return await promise
  } finally {
    if (ssoExchangeInflight?.code === code) {
      ssoExchangeInflight = null
    }
  }
}

export async function loginWithCrmCredentials({ username, password }) {
  const body = new URLSearchParams()
  body.append('username', username)
  body.append('password', password)
  const response = await fetch(`${CRM_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    credentials: 'include',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || 'Login failed')
  }
  const data = await response.json()
  saveCrmSession({
    accessToken: data.access_token,
    user: data.user_info,
    schema: data.user_info?.schema_name,
  })
  return data
}

export function fetchCustomers() {
  return crmRequest('/api/portal-admin/customers/')
}

export function fetchDashboardMetrics() {
  return crmRequest('/api/portal-admin/dashboard/metrics')
}

export function fetchAllCases(limit = 200) {
  return crmRequest(`/api/portal-admin/modules/cases?limit=${limit}`)
}

export function fetchAllOrders(limit = 200) {
  return crmRequest(`/api/portal-admin/modules/orders?limit=${limit}`)
}

export function fetchAllInvoices(limit = 200) {
  return crmRequest(`/api/portal-admin/modules/invoices?limit=${limit}`)
}

export function fetchCustomerDetail(contactId) {
  return crmRequest(`/api/portal-admin/customers/${contactId}`)
}

export function fetchCrmUsers() {
  return crmRequest('/users/')
}

export function fetchPortalAdmins() {
  return crmRequest('/api/portal-admin/admins')
}

export function fetchPortalSettings() {
  return crmRequest('/api/portal-admin/settings')
}

export function updatePortalSettings(body) {
  return crmRequest('/api/portal-admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function togglePortalAdmin(userId, enabled) {
  return crmRequest(`/api/portal-admin/admins/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      enabled,
      can_manage_portal_users: true,
      can_manage_portal_settings: false,
    }),
  })
}

export function enableCustomerPortal(contactId, { password, dataScope }) {
  return crmRequest(`/api/portal-admin/users/${contactId}/enable`, {
    method: 'POST',
    body: JSON.stringify({
      password: password || undefined,
      data_scope: dataScope || 'own',
    }),
  })
}

export function disableCustomerPortal(contactId) {
  return crmRequest(`/api/portal-admin/users/${contactId}/disable`, { method: 'POST' })
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString()
}

export function portalLoginLabel(customer) {
  if (!customer.portal_enabled && !customer.portal_user) return 'No'
  if (customer.portal_user?.is_active) return 'Active'
  return 'Inactive'
}

export { CRM_BASE, CALLBACK_URL }
