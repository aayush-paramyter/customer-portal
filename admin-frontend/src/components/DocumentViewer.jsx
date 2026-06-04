import { useEffect, useState } from 'react'
import { downloadDocument, fetchDocumentBlob, fetchDocumentHtml } from '../api/crmClient'

const HTML_PREVIEW_TYPES = new Set(['invoice', 'order'])

export default function DocumentViewer({ open, title, type, id, onClose }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!open || !id) return undefined

    let active = true
    setLoading(true)
    setError('')
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    const loadPreview = HTML_PREVIEW_TYPES.has(type)
      ? fetchDocumentHtml(type, id).then((html) => {
          const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
          return URL.createObjectURL(blob)
        })
      : fetchDocumentBlob(type, id, 'inline').then((blob) => URL.createObjectURL(blob))

    loadPreview
      .then((url) => {
        if (active) setPreviewUrl(url)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load document')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, id, type])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleDownload = async () => {
    setDownloading(true)
    setError('')
    try {
      const ext = type === 'attachment' ? '' : '.pdf'
      await downloadDocument(type, id, `${title}${ext}`)
    } catch (err) {
      setError(err.message || 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (!open) return null

  return (
    <div className="doc-viewer-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="doc-viewer-panel">
        <div className="doc-viewer-header">
          <h2 className="doc-viewer-title">{title}</h2>
          <div className="doc-viewer-actions">
            <button
              className="btn-outline btn-sm"
              disabled={downloading || loading}
              onClick={handleDownload}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              {downloading ? 'Downloading…' : 'Download PDF'}
            </button>
            <button className="btn-ghost btn-sm" onClick={onClose} type="button" aria-label="Close">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="alert-error doc-viewer-error" role="alert">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="doc-viewer-body">
          {loading ? (
            <div className="doc-viewer-loading">
              <span className="material-symbols-outlined spin text-[40px]" style={{ color: 'var(--color-primary)' }}>progress_activity</span>
              <p>Loading document…</p>
            </div>
          ) : previewUrl ? (
            <iframe className="doc-viewer-frame" src={previewUrl} title={title} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
