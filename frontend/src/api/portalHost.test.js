import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { bootstrapPortalHost, getPortalHostname, portalHostHeaders } from './portalHost'

describe('portalHost', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the browser hostname and origin to the API', () => {
    expect(getPortalHostname()).toBeTruthy()
    const headers = portalHostHeaders()
    expect(headers).toHaveProperty('X-Portal-Host', getPortalHostname())
    expect(headers).toHaveProperty('X-Portal-Origin', window.location.origin)
  })

  it('bootstrap stores tenant schema from host context', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        tenant_schema: 'tenant_acme',
        tenant_resolved_from_host: true,
        auth_method: 'both',
        custom_branding: { portalName: 'Acme Pharma', tagline: 'Support portal' },
      }),
    })
    const ctx = await bootstrapPortalHost()
    expect(ctx.tenant_schema).toBe('tenant_acme')
    expect(ctx.custom_branding.portalName).toBeTruthy()
    expect(localStorage.getItem('tenantSchema')).toBe('tenant_acme')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/portal/public/host-context'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Portal-Host': getPortalHostname() }),
      }),
    )
  })
})
