import { getApiBase } from './portalHost'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || payload.message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }
  return response.json()
}

export function withTenant(headers = {}) {
  const schema = localStorage.getItem('tenantSchema') || 'tenant_demo'
  return { ...headers, 'X-Tenant-Schema': schema }
}
