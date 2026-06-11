import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PortalBrandingProvider } from '../context/PortalBrandingContext'
import PortalFooter from './PortalFooter'

describe('PortalFooter', () => {
  it('renders copyright and footer links', () => {
    render(
      <PortalBrandingProvider
        branding={{ portalName: 'Acme Pharma', tagline: 'Partner portal', footerText: '' }}
        hostname="acme.localhost"
      >
        <PortalFooter />
      </PortalBrandingProvider>,
    )

    expect(screen.getByText(/Acme Pharma/)).toBeInTheDocument()
    expect(screen.getByText('Partner portal')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Support' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument()
  })
})
