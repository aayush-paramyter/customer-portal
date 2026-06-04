import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { bootstrapPortalHost, isLocalDevHost } from './portalHost'

describe('portalHost', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('treats localhost as dev host', () => {
    expect(isLocalDevHost()).toBe(true)
  })

  it('bootstrap on localhost uses stored tenant schema', async () => {
    localStorage.setItem('tenantSchema', 'tenant_acme')
    const ctx = await bootstrapPortalHost()
    expect(ctx.tenant_schema).toBe('tenant_acme')
    expect(ctx.tenant_resolved_from_host).toBe(false)
  })
})
