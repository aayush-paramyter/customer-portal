import { createContext, useContext, useMemo } from 'react'

import { getStoredBranding, normalizeBranding } from '../api/portalBranding'

const PortalBrandingContext = createContext(null)

export function PortalBrandingProvider({ branding, hostname, children }) {
  const value = useMemo(
    () => normalizeBranding(branding, hostname || window.location.hostname),
    [branding, hostname],
  )

  return (
    <PortalBrandingContext.Provider value={value}>
      {children}
    </PortalBrandingContext.Provider>
  )
}

export function usePortalBranding() {
  const context = useContext(PortalBrandingContext)
  return context || getStoredBranding()
}
