import { afterEach, describe, expect, it } from 'vitest'

import {
  applyBrandingToDocument,
  deriveHostnameLabel,
  footerLabel,
  normalizeBranding,
} from './portalBranding'

describe('portalBranding', () => {
  afterEach(() => {
    document.title = 'Portal'
    document.documentElement.style.removeProperty('--color-primary')
    delete document.documentElement.dataset.portalLogoUrl
  })

  it('derives a hostname label for local dev tenants', () => {
    expect(deriveHostnameLabel('master.localhost')).toBe('Master')
  })

  it('normalizes branding and applies document title', () => {
    const branding = normalizeBranding(
      { portalName: 'Acme Pharma', tagline: 'Support portal', primaryColor: '#123456' },
      'master.localhost',
    )
    applyBrandingToDocument(branding)
    expect(branding.portalName).toBe('Acme Pharma')
    expect(document.title).toBe('Acme Pharma — Support portal')
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#123456')
  })

  it('builds footer text from branding', () => {
    expect(footerLabel({ portalName: 'Acme', footerText: 'Custom footer' })).toBe('Custom footer')
    expect(footerLabel({ portalName: 'Acme' })).toMatch(/© \d{4} Acme/)
  })
})
