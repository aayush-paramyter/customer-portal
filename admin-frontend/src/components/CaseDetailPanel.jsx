import { useEffect, useState } from 'react'
import { downloadDocument, fetchCaseDetail, formatDate } from '../api/crmClient'
import DocumentViewer from './DocumentViewer'

export default function CaseDetailPanel({ open, caseId, caseNumber, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewer, setViewer] = useState(null)

  useEffect(() => {
    if (!open || !caseId) return undefined

    let active = true
    setLoading(true)
    setError('')
    setDetail(null)

    fetchCaseDetail(caseId)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load case')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, caseId])

  const handleAttachmentDownload = async (attachment) => {
    try {
      await downloadDocument('attachment', attachment.id, attachment.file_name)
    } catch (err) {
      setError(err.message || 'Download failed')
    }
  }

  if (!open) return null

  const title = detail?.case_number || caseNumber || `Case #${caseId}`

  return (
    <>
      <div className="doc-viewer-overlay" role="dialog" aria-modal="true" aria-label={title}>
        <div className="doc-viewer-panel doc-viewer-panel--case">
          <div className="doc-viewer-header">
            <h2 className="doc-viewer-title">{title}</h2>
            <button className="btn-ghost btn-sm" onClick={onClose} type="button" aria-label="Close">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {error ? (
            <div className="alert-error doc-viewer-error" role="alert">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          ) : null}

          <div className="doc-viewer-body doc-viewer-body--case">
            {loading ? (
              <div className="doc-viewer-loading">
                <span className="material-symbols-outlined spin text-[40px]" style={{ color: 'var(--color-primary)' }}>progress_activity</span>
                <p>Loading case details…</p>
              </div>
            ) : detail ? (
              <div className="case-detail-content">
                <div className="case-detail-meta">
                  <div>
                    <span className="font-label-md text-label-md text-outline">Subject</span>
                    <p className="font-body-lg text-body-lg font-medium text-on-surface">{detail.subject || '—'}</p>
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-outline">Status</span>
                    <p>
                      <span className="table-badge badge-blue">{detail.status || 'Unknown'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-outline">Last Updated</span>
                    <p className="font-body-md text-on-surface">{formatDate(detail.updated_at)}</p>
                  </div>
                </div>

                {detail.description ? (
                  <div className="case-detail-description">
                    <span className="font-label-md text-label-md text-outline">Description</span>
                    <p className="font-body-md text-on-surface-variant whitespace-pre-wrap">{detail.description}</p>
                  </div>
                ) : null}

                <div className="case-detail-attachments">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-sm">Attachments</h3>
                  {detail.attachments?.length ? (
                    <ul className="case-attachment-list">
                      {detail.attachments.map((attachment) => (
                        <li key={attachment.id} className="case-attachment-item">
                          <div className="case-attachment-info">
                            <span className="material-symbols-outlined text-primary">attach_file</span>
                            <span className="font-body-md text-on-surface">{attachment.file_name}</span>
                          </div>
                          <div className="case-attachment-actions">
                            <button
                              className="btn-ghost btn-sm"
                              onClick={() => setViewer({ id: attachment.id, title: attachment.file_name })}
                              type="button"
                            >
                              View
                            </button>
                            <button
                              className="btn-outline btn-sm"
                              onClick={() => handleAttachmentDownload(attachment)}
                              type="button"
                            >
                              Download
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-body-md text-on-surface-variant">No attachments for this case.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {viewer ? (
        <DocumentViewer
          id={viewer.id}
          open
          title={viewer.title}
          type="attachment"
          onClose={() => setViewer(null)}
        />
      ) : null}
    </>
  )
}
