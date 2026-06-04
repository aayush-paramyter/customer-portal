import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PortalLayout from '../components/PortalLayout'
import { usePortalList, formatDate } from '../hooks/usePortalData'

const STATUS_CONFIG = {
  Processing: { label: 'Processing', cls: 'badge-blue'   },
  Shipped:    { label: 'Shipped',    cls: 'badge-teal'   },
  Delivered:  { label: 'Delivered',  cls: 'badge-green'  },
  Pending:    { label: 'Pending',    cls: 'badge-orange' },
  Cancelled:  { label: 'Cancelled',  cls: 'badge-gray'   },
  Refunded:   { label: 'Refunded',   cls: 'badge-pink'   },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge-gray' }
  return <span className={`table-badge ${cfg.cls}`}>{cfg.label}</span>
}

function formatCurrency(amount, currency) {
  if (amount == null) return '—'
  const num = parseFloat(amount)
  if (isNaN(num)) return '—'
  return (currency ? currency + ' ' : '$') + num.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

const PAGE_SIZE = 10

export default function OrdersListPage() {
  const navigate = useNavigate()
  const { items, loading, error } = usePortalList('/api/portal/orders')

  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const [page, setPage]             = useState(1)

  const filtered = useMemo(() => {
    let list = items
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => (i.order_number || '').toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') {
      list = list.filter(i => i.status === statusFilter)
    }
    if (dateFrom) {
      const from = new Date(dateFrom)
      list = list.filter(i => new Date(i.order_date) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59)
      list = list.filter(i => new Date(i.order_date) <= to)
    }
    return list
  }, [items, search, statusFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const reset = () => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); setPage(1) }

  return (
    <PortalLayout
      title="Orders"
      subtitle="Manage and track your recent B2B orders."
    >
      {error && <div className="alert-error">{error}</div>}

      {/* ── Filter bar ── */}
      <div className="list-toolbar list-toolbar--orders">
        <div className="list-search-wrap" style={{ flex: '1 1 260px' }}>
          <span className="material-symbols-outlined list-search-icon">search</span>
          <input
            id="orders-search"
            className="list-search-input"
            type="search"
            placeholder="Search by order number..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="list-filter-group">
          <div className="list-select-wrap">
            <label className="list-filter-label" htmlFor="orders-status-filter">Status</label>
            <select id="orders-status-filter" className="list-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="all">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <span className="material-symbols-outlined list-select-icon">expand_more</span>
          </div>

          <div className="list-daterange-wrap">
            <label className="list-filter-label">Date Range</label>
            <div className="list-daterange-inputs">
              <input
                id="orders-date-from"
                className="list-date-input"
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                placeholder="mm/dd/yyyy"
              />
              <span className="list-daterange-sep">–</span>
              <input
                id="orders-date-to"
                className="list-date-input"
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1) }}
                placeholder="mm/dd/yyyy"
              />
            </div>
          </div>

          {(search || statusFilter !== 'all' || dateFrom || dateTo) && (
            <button className="btn-ghost" onClick={reset} type="button" style={{ whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle' }}>filter_list_off</span>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Order Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Items</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th>Action</th>
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
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 8 }}>shopping_cart</span>
                  No orders found
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} className="data-table-row" onClick={() => navigate(`/orders/${item.id}`)}>
                  <td>
                    <Link
                      to={`/orders/${item.id}`}
                      className="table-link"
                      onClick={e => e.stopPropagation()}
                    >
                      #{item.order_number}
                    </Link>
                  </td>
                  <td className="table-cell-muted">{formatDate(item.order_date)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="table-cell-muted" style={{ textAlign: 'right' }}>{item.item_count ?? item.items ?? '—'}</td>
                  <td className="table-cell-amount">{formatCurrency(item.total_amount, item.currency)}</td>
                  <td>
                    {item.invoice_id ? (
                      <Link
                        to={`/invoices/${item.invoice_id}`}
                        className="table-action-link"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 4 }}>receipt</span>
                        Invoice
                      </Link>
                    ) : (
                      <span className="table-cell-muted" style={{ fontSize: 13 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 3 }}>hourglass_empty</span>
                        Pending
                      </span>
                    )}
                  </td>
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
            Showing <strong>{(page - 1) * PAGE_SIZE + 1}</strong> to <strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> entries
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
                  <span key={`e-${idx}`} className="page-ellipsis">…</span>
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
