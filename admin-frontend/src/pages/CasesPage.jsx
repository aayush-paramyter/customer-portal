import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAllCases, formatDate } from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'

export default function CasesPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllCases()
      .then((data) => setCases(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cases.filter((c) => {
      if (statusFilter && (c.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false
      if (!q) return true
      return (
        (c.case_number || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q) ||
        (c.contact_name || '').toLowerCase().includes(q)
      )
    })
  }, [cases, search, statusFilter])

  const statuses = useMemo(
    () => [...new Set(cases.map((c) => c.status).filter(Boolean))],
    [cases],
  )

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'badge-blue'
      case 'In Progress': return 'badge-orange'
      case 'Waiting on Customer': return 'badge-pink'
      case 'Closed': return 'badge-gray'
      case 'Resolved': return 'badge-green'
      default: return 'badge-gray'
    }
  }

  return (
    <AdminLayout 
      title="Cases"
      subtitle="All support cases across your CRM, linked to customers."
    >
      {error && (
        <div className="alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="list-toolbar">
        <div className="list-search-wrap">
          <span className="material-symbols-outlined list-search-icon">search</span>
          <input
            id="cases-search"
            className="list-search-input"
            type="search"
            placeholder="Search case #, subject, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="list-select-wrap">
          <select 
            id="cases-status-filter" 
            className="list-select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="material-symbols-outlined list-select-icon">expand_more</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Case #</th>
              <th>Subject</th>
              <th>Customer</th>
              <th>Account</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  <span className="material-symbols-outlined spin" style={{ fontSize: 28, color: 'var(--color-primary)' }}>progress_activity</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)', display: 'block', marginBottom: 8 }}>inbox</span>
                  No cases found
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="data-table-row" onClick={() => c.contact_id && navigate(`/customers/${c.contact_id}`)}>
                  <td className="table-link">{c.case_number}</td>
                  <td className="table-cell-subject">{c.subject}</td>
                  <td className="table-cell-subject">{c.contact_name || '—'}</td>
                  <td className="table-cell-muted">{c.account_name || '—'}</td>
                  <td>
                    <span className={`table-badge ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="table-cell-muted">{formatDate(c.updated_at)}</td>
                  <td>
                    {c.contact_id ? (
                      <Link to={`/customers/${c.contact_id}`} className="table-action-link" onClick={(e) => e.stopPropagation()}>
                        Customer
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
