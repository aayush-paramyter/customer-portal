import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchAllOrders, formatDate } from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) =>
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.contact_name || '').toLowerCase().includes(q) ||
        (o.status || '').toLowerCase().includes(q),
    )
  }, [orders, search])

  return (
    <AdminLayout 
      title="Orders"
      subtitle="All orders in your CRM with customer and account context."
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
            id="orders-search"
            className="list-search-input"
            type="search"
            placeholder="Search order #, customer, status…"
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
              <th>Order #</th>
              <th>Customer</th>
              <th>Account</th>
              <th>Status</th>
              <th className="text-right">Total</th>
              <th>Date</th>
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
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="data-table-row" onClick={() => o.contact_id && navigate(`/customers/${o.contact_id}`)}>
                  <td className="table-link">{o.order_number}</td>
                  <td className="table-cell-subject">{o.contact_name || '—'}</td>
                  <td className="table-cell-muted">{o.account_name || '—'}</td>
                  <td>
                    <span className="table-badge badge-teal">{o.status}</span>
                  </td>
                  <td className="table-cell-amount">{o.currency} {parseFloat(o.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="table-cell-muted">{formatDate(o.order_date)}</td>
                  <td>
                    {o.contact_id ? (
                      <Link to={`/customers/${o.contact_id}`} className="table-action-link" onClick={(e) => e.stopPropagation()}>
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
