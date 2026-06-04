import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PortalLayout from '../components/PortalLayout'
import { usePortalList, formatDate } from '../hooks/usePortalData'

const STATUS_CONFIG = {
  Open:              { label: 'Open',               cls: 'badge-blue'    },
  'In Progress':     { label: 'In Progress',         cls: 'badge-orange'  },
  'Waiting on Customer': { label: 'Waiting on Customer', cls: 'badge-pink' },
  Closed:            { label: 'Closed',              cls: 'badge-gray'    },
  Resolved:          { label: 'Resolved',            cls: 'badge-green'   },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge-gray' }
  return <span className={`table-badge ${cfg.cls}`}>{cfg.label}</span>
}

const PAGE_SIZE = 10

export default function CasesListPage() {
  const navigate = useNavigate()
  const { items, loading, error } = usePortalList('/api/portal/cases')

  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage]         = useState(1)

  const filtered = useMemo(() => {
    let list = items
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        (i.case_number || '').toLowerCase().includes(q) ||
        (i.subject || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      list = list.filter(i => i.status === statusFilter)
    }
    return list
  }, [items, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }
  const handleStatus = (e) => { setStatusFilter(e.target.value); setPage(1) }

  return (
    <PortalLayout
      title="Support Cases"
      subtitle="Manage and track your ongoing support requests."
      actions={
        <button
          className="btn-primary"
          onClick={() => navigate('/cases/new')}
          type="button"
          id="create-case-btn"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 6 }}>add</span>
          Create New Case
        </button>
      }
    >
      {error && <div className="alert-error" role="alert">{error}</div>}

      {/* ── Filter bar ── */}
      <div className="list-toolbar">
        <div className="list-search-wrap">
          <span className="material-symbols-outlined list-search-icon">search</span>
          <input
            id="cases-search"
            className="list-search-input"
            type="search"
            placeholder="Search by case number or subject..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="list-select-wrap">
          <select id="cases-status-filter" className="list-select" value={statusFilter} onChange={handleStatus}>
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting on Customer">Waiting on Customer</option>
            <option value="Closed">Closed</option>
            <option value="Resolved">Resolved</option>
          </select>
          <span className="material-symbols-outlined list-select-icon">expand_more</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Last Updated</th>
              <th>Related Order</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  <span className="material-symbols-outlined spin" style={{ fontSize: 28, color: 'var(--color-primary)' }}>progress_activity</span>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 8 }}>inbox</span>
                  No cases found
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} className="data-table-row" onClick={() => navigate(`/cases/${item.id}`)}>
                  <td>
                    <Link
                      to={`/cases/${item.id}`}
                      className="table-link"
                      onClick={e => e.stopPropagation()}
                    >
                      {item.case_number || `CAS-${item.id}`}
                    </Link>
                  </td>
                  <td className="table-cell-subject">{item.subject}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="table-cell-muted">{formatDate(item.created_at)}</td>
                  <td className="table-cell-muted">{formatDate(item.updated_at)}</td>
                  <td className="table-cell-muted">{item.related_order || item.order_number || <em>None</em>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && filtered.length > 0 && (
        <div className="pagination-bar">
          <span className="pagination-info">
            Showing <strong>{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> cases
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn${p === page ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              aria-label="Next page"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
