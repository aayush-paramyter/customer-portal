import { useCallback, useEffect, useState } from 'react'

import { portalFetch } from '../api/portalApi'

export function contactDisplayName(profile) {
  if (!profile) return ''
  const parts = [profile.first_name, profile.last_name].filter(Boolean)
  return parts.join(' ').trim() || profile.email || ''
}

export function contactInitials(profile) {
  const name = contactDisplayName(profile)
  if (!name) return '?'
  const bits = name.split(/\s+/).filter(Boolean)
  if (bits.length >= 2) {
    return `${bits[0][0]}${bits[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function usePortalProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await portalFetch('/api/portal/profile/')
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to load profile')
      setProfile(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { profile, loading, error, reload }
}
