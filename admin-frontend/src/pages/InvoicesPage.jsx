import { useEffect, useMemo, useState } from 'react'
import { fetchAllInvoices, formatDate } from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllInvoices()
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return invoices
    return invoices.filter(
      (inv) =>
        (inv.invoice_number || '').toLowerCase().includes(q) ||
        (inv.account_name || '').toLowerCase().includes(q) ||
        (inv.status || '').toLowerCase().includes(q),
    )
  }, [invoices, search])

  return (
    <AdminLayout 
      title="Invoices"
      subtitle="All invoices in your CRM, grouped by customer account."
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
            id="invoices-search"
            className="list-search-input"
            type="search"
            placeholder="Search invoice #, account, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Account</th>
              <th>Status</th>
              <th className="text-right">Total</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  <span className="material-symbols-outlined spin" style={{ fontSize: 28, color: 'var(--color-primary)' }}>progress_activity</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)', display: 'block', marginBottom: 8 }}>inbox</span>
                  No invoices found
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="data-table-row">
                  <td className="table-link">{inv.invoice_number}</td>
                  <td className="table-cell-subject">{inv.account_name || '—'}</td>
                  <td>
                    <span className={`table-badge ${inv.status === 'Paid' ? 'badge-green' : 'badge-orange'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="table-cell-amount">{inv.currency} {parseFloat(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="table-cell-muted">{formatDate(inv.invoice_date)}</td>
                  <td className="table-cell-muted">{formatDate(inv.due_date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
