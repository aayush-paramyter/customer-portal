import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { apiRequest } from './client'
import { getPortalHostname } from './portalHost'

describe('apiRequest', () => {
  beforeEach(() => {
    localStorage.setItem('tenantSchema', 'tenant_master')
    localStorage.setItem('portalAccessToken', 'expired-token')
    localStorage.setItem('portalRefreshToken', 'valid-refresh')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('keeps portal host headers when callers pass their own headers', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })

    await apiRequest('/api/portal/auth/magic-link/request', {
      method: 'POST',
      headers: { 'X-Tenant-Schema': 'tenant_master' },
      body: '{}',
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/portal/auth/magic-link/request'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Portal-Host': getPortalHostname(),
          'X-Portal-Origin': window.location.origin,
          'X-Tenant-Schema': 'tenant_master',
        }),
      }),
    )
  })

  it('refreshes access token on 401 and retries the original request', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Token expired' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'new-access', refresh_token: 'new-refresh' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 1 }],
      })

    const data = await apiRequest('/api/portal/cases', {
      headers: { Authorization: 'Bearer expired-token', 'X-Tenant-Schema': 'tenant_master' },
    })

    expect(data).toEqual([{ id: 1 }])
    expect(localStorage.getItem('portalAccessToken')).toBe('new-access')
    expect(localStorage.getItem('portalRefreshToken')).toBe('new-refresh')
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})
