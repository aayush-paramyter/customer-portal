import { getApiBase, portalHostHeaders } from './portalHost'
import {
  clearPortalTokens,
  getRefreshToken,
  savePortalTokens,
} from './portalSession'
import { withTenant } from './tenant'

let refreshInFlight = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('Session expired')
  }

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${getApiBase()}/api/portal/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...portalHostHeaders(),
        ...withTenant(),
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.detail || payload.message || 'Session expired')
        }
        savePortalTokens({
          accessToken: payload.access_token,
          refreshToken: payload.refresh_token,
        })
        return payload.access_token
      })
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

function shouldRetryWithRefresh(response, options) {
  if (options._skipAuthRetry) return false
  if (response.status !== 401) return false
  return Boolean(getRefreshToken())
}

export async function apiRequest(path, options = {}) {
  const { headers: optionHeaders, ...rest } = options

  const buildHeaders = () => ({
    'Content-Type': 'application/json',
    ...portalHostHeaders(),
    ...(optionHeaders || {}),
  })

  let response = await fetch(`${getApiBase()}${path}`, {
    ...rest,
    headers: buildHeaders(),
  })

  if (shouldRetryWithRefresh(response, options)) {
    try {
      const accessToken = await refreshAccessToken()
      const retryHeaders = {
        ...buildHeaders(),
        Authorization: `Bearer ${accessToken}`,
      }
      response = await fetch(`${getApiBase()}${path}`, {
        ...rest,
        headers: retryHeaders,
      })
    } catch (err) {
      clearPortalTokens()
      throw err
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const message = payload.detail || payload.message || `Request failed: ${response.status}`
    if (response.status === 401) {
      clearPortalTokens()
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }
  return response.json()
}

export { withTenant } from './tenant'
