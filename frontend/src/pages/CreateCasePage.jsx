import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { portalFetch } from '../api/portalApi'
import PortalLayout from '../components/PortalLayout'

const CATEGORIES = [
  'Billing & Invoicing',
  'Order Issues',
  'Shipping & Delivery',
  'Product / Technical',
  'Account & Access',
  'API / Integration',
  'Other',
]

export default function CreateCasePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [subject, setSubject]           = useState('')
  const [category, setCategory]         = useState('')
  const [description, setDescription]   = useState('')
  const [orderNumber, setOrderNumber]   = useState('')
  const [attachments, setAttachments]   = useState([])
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [dragOver, setDragOver]         = useState(false)

  const addFiles = (files) => {
    const fileList = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024)
    setAttachments(prev => [...prev, ...fileList])
  }

  const removeFile = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx))

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const created = await portalFetch('/api/portal/cases', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          description,
          category: category || undefined,
          order_number: orderNumber || undefined,
        }),
      })
      navigate(`/cases/${created.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout
      title="Create New Case"
      subtitle="Describe your issue and we'll get back to you as soon as possible."
      breadcrumb={[{ label: 'Cases', to: '/cases' }, { label: 'Create New Case' }]}
    >
      <div className="form-page-wrap">
        <form className="form-card" onSubmit={onSubmit} id="create-case-form">
          {/* Subject */}
          <div className="form-group">
            <label className="form-label" htmlFor="case-subject">
              Subject <span className="form-required">*</span>
            </label>
            <input
              id="case-subject"
              className="form-input"
              type="text"
              placeholder="Brief description of your issue"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          {/* Category + Related Order */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="case-category">
                Category <span className="form-required">*</span>
              </label>
              <div className="form-select-wrap">
                <select
                  id="case-category"
                  className="form-select"
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined form-select-icon">expand_more</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="related-order">
                Related Order <span className="form-optional">(Optional)</span>
              </label>
              <div className="form-select-wrap">
                <select
                  id="related-order"
                  className="form-select"
                  value={orderNumber}
                  onChange={e => setOrderNumber(e.target.value)}
                >
                  <option value="">Select an order (optional)</option>
                </select>
                <span className="material-symbols-outlined form-select-icon">expand_more</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="case-description">
              Description <span className="form-required">*</span>
            </label>
            <textarea
              id="case-description"
              className="form-input form-textarea"
              placeholder="Provide details about your issue..."
              required
              rows={7}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Attachments */}
          <div className="form-group">
            <label className="form-label">Attachments</label>
            <div
              className={`dropzone${dragOver ? ' dropzone--active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <div className="dropzone-icon-wrap">
                <span className="material-symbols-outlined dropzone-icon">cloud_upload</span>
              </div>
              <p className="dropzone-text">Drag files here or click to upload</p>
              <p className="dropzone-hint">Accepted formats: PNG, JPG, PDF, DOC up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
              />
            </div>
            {attachments.length > 0 && (
              <ul className="attachment-list">
                {attachments.map((f, i) => (
                  <li key={i} className="attachment-item">
                    <span className="material-symbols-outlined attachment-icon">attach_file</span>
                    <span className="attachment-name">{f.name}</span>
                    <span className="attachment-size">({(f.size / 1024).toFixed(0)} KB)</span>
                    <button
                      type="button"
                      className="attachment-remove"
                      onClick={() => removeFile(i)}
                      aria-label="Remove file"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate('/cases')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="submit-case-btn"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined spin" style={{ fontSize: 17, verticalAlign: 'middle', marginRight: 6 }}>progress_activity</span>
                  Submitting…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 17, verticalAlign: 'middle', marginRight: 6 }}>send</span>
                  Submit Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PortalLayout>
  )
}
