import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PortalLayout from '../components/PortalLayout'
import { usePortalList, formatDate } from '../hooks/usePortalData'

const STATUS_CONFIG = {
  Paid:     { label: 'PAID',     cls: 'badge-green'  },
  Pending:  { label: 'PENDING',  cls: 'badge-gray'   },
  Overdue:  { label: 'OVERDUE',  cls: 'badge-red'    },
  Draft:    { label: 'DRAFT',    cls: 'badge-blue'   },
  Cancelled:{ label: 'CANCELLED',cls: 'badge-gray'   },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status?.toUpperCase(), cls: 'badge-gray' }
  return <span className={`table-badge ${cfg.cls}`}>{cfg.label}</span>
}

function formatCurrency(amount, currency) {
  if (amount == null) return '—'
  const num = parseFloat(amount)
  if (isNaN(num)) return '—'
  return (currency ? currency + ' ' : '$') + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PAGE_SIZE = 10

function StatCard({ icon, label, value, sub, variant }) {
  return (
    <div className={`invoice-stat-card${variant ? ` invoice-stat-card--${variant}` : ''}`}>
      <div className="invoice-stat-header">
        <span className="invoice-stat-label">{label}</span>
        <span className="material-symbols-outlined invoice-stat-icon">{icon}</span>
      </div>
      <div className="invoice-stat-value">{value}</div>
      {sub && <div className="invoice-stat-sub">{sub}</div>}
    </div>
  )
}

export default function InvoicesListPage() {
  const navigate = useNavigate()
  const { items, loading, error } = usePortalList('/api/portal/invoices')

  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage]             = useState(1)

  const totalOutstanding = useMemo(
    () => items.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((s, i) => s + parseFloat(i.total_amount || 0), 0),
    [items]
  )
  const totalOverdue = useMemo(
    () => items.filter(i => i.status === 'Overdue').reduce((s, i) => s + parseFloat(i.total_amount || 0), 0),
    [items]
  )
  const totalPaidThisMonth = useMemo(() => {
    const now = new Date()
    return items
      .filter(i => i.status === 'Paid' && i.payment_date && new Date(i.payment_date).getMonth() === now.getMonth())
      .reduce((s, i) => s + parseFloat(i.total_amount || 0), 0)
  }, [items])

  const filtered = useMemo(() => {
    let list = items
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        (i.invoice_number || '').toLowerCase().includes(q) ||
        (i.related_order  || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      list = list.filter(i => i.status === statusFilter)
    }
    return list
  }, [items, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <PortalLayout
      title="Invoices"
      subtitle="Manage and track your billing history."
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" id="export-invoices-btn" type="button">
            <span className="material-symbols-outlined" style={{ fontSize: 17, verticalAlign: 'middle', marginRight: 5 }}>download</span>
            Export List
          </button>
        </div>
      }
    >
      {error && <div className="alert-error">{error}</div>}

      {/* ── Summary cards ── */}
      {!loading && (
        <div className="invoice-stats-row">
          <StatCard
            icon="receipt_long"
            label="TOTAL OUTSTANDING"
            value={`$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            sub={`Across ${items.filter(i => i.status !== 'Paid').length} invoices`}
          />
          <StatCard
            icon="warning"
            label="OVERDUE"
            value={`$${totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            sub={`${items.filter(i => i.status === 'Overdue').length} invoices require attention`}
            variant="danger"
          />
          <StatCard
            icon="check_circle"
            label="PAID THIS MONTH"
            value={`$${totalPaidThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            sub="+12% vs last month"
          />
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="list-toolbar">
        <div className="list-search-wrap">
          <span className="material-symbols-outlined list-search-icon">search</span>
          <input
            id="invoices-search"
            className="list-search-input"
            type="search"
            placeholder="Search invoice or order #..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="list-select-wrap">
          <select id="invoices-status-filter" className="list-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <span className="material-symbols-outlined list-select-icon">expand_more</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
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
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 8 }}>receipt_long</span>
                  No invoices found
                </td>
              </tr>
            ) : (
              paginated.map((item) => {
                const isOverdue = item.status === 'Overdue'
                return (
                  <tr key={item.id} className="data-table-row" onClick={() => navigate(`/invoices/${item.id}`)}>
                    <td>
                      <Link
                        to={`/invoices/${item.id}`}
                        className="table-link"
                        onClick={e => e.stopPropagation()}
                      >
                        {item.invoice_number}
                      </Link>
                    </td>
                    <td className="table-cell-muted">{formatDate(item.invoice_date)}</td>
                    <td className={isOverdue ? 'table-cell-danger' : 'table-cell-muted'}>
                      {formatDate(item.due_date)}
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td className="table-cell-amount">{formatCurrency(item.total_amount, item.currency)}</td>
                    <td className="table-cell-muted">{item.related_order || '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && filtered.length > 0 && (
        <div className="pagination-bar">
          <span className="pagination-info">
            Showing <strong>{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> to <strong>{filtered.length}</strong> invoices
          </span>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Previous">
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
                  <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )
              )}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  )
}
