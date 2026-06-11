export function getAccessToken() {
  return localStorage.getItem('portalAccessToken')
}

export function getRefreshToken() {
  return localStorage.getItem('portalRefreshToken')
}

export function savePortalTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('portalAccessToken', accessToken)
  if (refreshToken) localStorage.setItem('portalRefreshToken', refreshToken)
}

export function clearPortalTokens() {
  localStorage.removeItem('portalAccessToken')
  localStorage.removeItem('portalRefreshToken')
}
