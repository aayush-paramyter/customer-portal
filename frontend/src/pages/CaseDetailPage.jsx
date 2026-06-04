import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { portalFetch } from '../api/portalApi'
import PortalLayout from '../components/PortalLayout'
import { usePortalItem, formatDate } from '../hooks/usePortalData'

export default function CaseDetailPage() {
  const { id } = useParams()
  const { item: found, loading, error } = usePortalItem(id ? `/api/portal/cases/${id}` : null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (!id) return undefined
    portalFetch(`/api/portal/cases/${id}/comments`)
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {})
    return undefined
  }, [id])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentError('')
    setSubmittingComment(true)
    try {
      const created = await portalFetch(`/api/portal/cases/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment: commentText }),
      })
      setComments((prev) => [...prev, created])
      setCommentText('')
    } catch (err) {
      setCommentError(err.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <PortalLayout title="Support Case">
        <div className="text-center py-xl text-on-surface-variant font-body-md">
          <span className="material-symbols-outlined animate-spin text-[32px] mb-xs">refresh</span>
          <p>Loading case details…</p>
        </div>
      </PortalLayout>
    )
  }

  // Helper for Status Badge styling
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    let classes = 'bg-surface-variant text-on-surface-variant'
    if (s === 'open' || s === 'new' || s === 'overdue') {
      classes = 'bg-error-container text-on-error-container'
    } else if (s === 'resolved' || s === 'paid' || s === 'delivered' || s === 'shipped') {
      classes = 'bg-secondary-container text-on-secondary-container'
    } else if (s === 'pending' || s === 'processing') {
      classes = 'bg-surface-container-highest text-on-surface'
    }
    return (
      <span className={`inline-flex items-center px-sm py-[2px] rounded-full font-label-md text-label-md uppercase tracking-wider ${classes}`}>
        {status || 'UNKNOWN'}
      </span>
    )
  }

  return (
    <PortalLayout title={`Case ${found?.case_number || ''}`}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-sm text-secondary">
        <Link to="/cases" className="flex items-center gap-xs hover:text-primary transition-colors font-label-md text-label-md group">
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Cases
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="font-label-md text-label-md text-on-surface-variant">Case #{found?.case_number}</span>
      </nav>

      {error ? (
        <div className="bg-error-container text-on-error-container p-md rounded-xl text-sm font-medium">
          {error}
        </div>
      ) : null}

      {/* Page Header Section */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-md pb-lg border-b border-outline-variant">
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-md flex-wrap">
            <h1 className="font-display-lg text-display-lg text-on-surface" style={{ margin: '0' }}>{found?.subject || 'Case Details'}</h1>
            {getStatusBadge(found?.status)}
          </div>
          <div className="flex items-center gap-lg text-on-surface-variant flex-wrap font-body-md text-body-md">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">tag</span>
              <span className="font-mono-sm text-mono-sm">{found?.case_number}</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Created: {formatDate(found?.created_at)}</span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">update</span>
              <span>Last Updated: {formatDate(found?.updated_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md flex items-center gap-xs bg-surface-container-lowest" style={{ height: '36px' }}>
            <span className="material-symbols-outlined text-[18px]">escalator_warning</span>
            Escalate
          </button>
          <button className="px-md py-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-md text-label-md shadow-sm" style={{ height: '36px' }}>
            Resolve Case
          </button>
        </div>
      </header>

      {/* Content Layout: Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" style={{ display: 'grid', alignItems: 'start' }}>
        {/* Left Column: Primary Content (Description & Thread) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Description Card */}
          <section className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-secondary">subject</span>
              Description
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {found?.description || 'No description provided.'}
            </p>
          </section>

          {/* Activity / Comments Thread */}
          <section className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant flex flex-col gap-lg" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-xs border-b border-outline-variant pb-sm" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined text-secondary">forum</span>
              Case Activity
            </h2>
            
            <div className="flex flex-col gap-xl" style={{ display: 'flex', flexDirection: 'column' }}>
              {comments.map((c) => {
                const isAgent = (c.user_name || '').toLowerCase().includes('agent') || (c.user_name || '').toLowerCase().includes('support')
                return (
                  <div key={c.id} className={`flex gap-md ${isAgent ? 'flex-row-reverse' : ''}`} style={{ display: 'flex' }}>
                    <div 
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-headline-sm text-headline-sm shadow-sm ${
                        isAgent ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'
                      }`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {isAgent ? (
                        <span className="material-symbols-outlined text-[20px]">support_agent</span>
                      ) : (
                        (c.user_name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    <div className={`flex flex-col gap-xs flex-1 ${isAgent ? 'items-end' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className={`flex items-baseline justify-between w-full ${isAgent ? 'flex-row-reverse' : ''}`} style={{ display: 'flex' }}>
                        <span className="font-label-md text-label-md text-on-surface font-bold">{c.user_name || 'User'}</span>
                        <span className="font-label-md text-label-md text-outline">{formatDate(c.created_at)}</span>
                      </div>
                      
                      <div 
                        className={`p-md rounded-lg border text-on-surface-variant font-body-md text-body-md ${
                          isAgent 
                            ? 'bg-secondary-container/20 border-secondary-container rounded-tr-none' 
                            : 'bg-surface-container-low border-outline-variant rounded-tl-none'
                        }`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {c.comment}
                      </div>
                    </div>
                  </div>
                )
              })}

              {comments.length === 0 ? (
                <div className="text-center py-md text-on-surface-variant font-body-md">
                  No activity comments yet. Feel free to add a message below.
                </div>
              ) : null}
            </div>
          </section>

          {/* Add Comment Section */}
          <section className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant">
            <form onSubmit={submitComment} className="flex flex-col gap-md">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="new-comment">Add a comment</label>
              <textarea 
                className="w-full border border-outline-variant rounded-lg p-md focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md resize-none placeholder-outline" 
                id="new-comment" 
                placeholder="Type your message here..." 
                rows="4"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              {commentError ? (
                <div className="bg-error-container text-on-error-container p-sm rounded text-xs font-medium">
                  {commentError}
                </div>
              ) : null}
              <div className="flex justify-between items-center mt-md" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="text-secondary hover:text-primary transition-colors flex items-center gap-xs font-label-md text-label-md bg-transparent border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                  Attach file
                </button>
                <button 
                  disabled={submittingComment || !commentText.trim()}
                  className="bg-primary text-on-primary hover:bg-primary-container transition-colors px-lg py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs shadow-sm cursor-pointer"
                  style={{ height: '36px' }}
                  type="submit"
                >
                  {submittingComment ? 'Submitting…' : 'Submit Comment'}
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Meta Information */}
        <div className="lg:col-span-4 flex flex-col gap-gutter" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Case Information Card */}
          <aside className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md border-b border-outline-variant pb-sm">Case Details</h3>
            <dl className="flex flex-col gap-md" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex flex-col gap-xs">
                <dt className="font-label-md text-label-md text-outline uppercase tracking-wider">Account</dt>
                <dd className="font-body-md text-body-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">domain</span>
                  Enterprise Client
                </dd>
              </div>
              <div className="flex flex-col gap-xs">
                <dt className="font-label-md text-label-md text-outline uppercase tracking-wider">Case Status</dt>
                <dd className="font-body-md text-body-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
                  {found?.status || 'Unknown'}
                </dd>
              </div>
              <div className="flex flex-col gap-xs">
                <dt className="font-label-md text-label-md text-outline uppercase tracking-wider">Case Source</dt>
                <dd className="font-body-md text-body-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">language</span>
                  Web Portal
                </dd>
              </div>
            </dl>
          </aside>

          {/* Attachments Card (Static representation matching high-fidelity layout details) */}
          <aside className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md border-b border-outline-variant pb-sm flex items-center gap-xs" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined text-secondary text-[20px]">attachment</span>
              Attachments
            </h3>
            <ul className="flex flex-col gap-sm" style={{ display: 'flex', flexDirection: 'column', listStyle: 'none' }}>
              <li>
                <a className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container transition-colors group border border-transparent hover:border-outline-variant" href="#delivery-note" style={{ display: 'flex' }}>
                  <div 
                    className="w-8 h-8 rounded bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  </div>
                  <div className="flex flex-col flex-grow overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="font-body-md text-body-md text-on-surface truncate group-hover:text-primary transition-colors">delivery_note.pdf</span>
                    <span className="font-label-md text-label-md text-outline">1.2 MB</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-opacity text-[18px]">download</span>
                </a>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </PortalLayout>
  )
}
