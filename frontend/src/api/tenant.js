export function withTenant(headers = {}) {
  const schema = localStorage.getItem('tenantSchema')
  if (!schema) {
    throw new Error('Portal tenant is not configured for this URL')
  }
  return { ...headers, 'X-Tenant-Schema': schema }
}
