import { useEffect, useState } from 'react'

import { portalFetch } from '../api/portalApi'

export function usePortalList(path) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    portalFetch(path)
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : [])
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [path])

  return { items, loading, error }
}

export function usePortalItem(path) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!path) return undefined
    let cancelled = false
    setLoading(true)
    portalFetch(path)
      .then((data) => {
        if (!cancelled) {
          setItem(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [path])

  return { item, loading, error }
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString()
}
