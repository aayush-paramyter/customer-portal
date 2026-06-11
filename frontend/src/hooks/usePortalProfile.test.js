import { describe, expect, it } from 'vitest'

import { contactDisplayName, contactInitials } from './usePortalProfile'

describe('usePortalProfile helpers', () => {
  it('formats contact display name and initials', () => {
    const profile = { first_name: 'Aayush', last_name: 'Rawat', email: 'a@example.com', account_name: 'Acme' }
    expect(contactDisplayName(profile)).toBe('Aayush Rawat')
    expect(contactInitials(profile)).toBe('AR')
  })

  it('falls back to email when name is missing', () => {
    const profile = { email: 'user@example.com' }
    expect(contactDisplayName(profile)).toBe('user@example.com')
    expect(contactInitials(profile)).toBe('US')
  })
})
