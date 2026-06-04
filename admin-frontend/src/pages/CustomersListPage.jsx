import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCustomers, portalLoginLabel } from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'

export default function CustomersListPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        (c.display_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.account_name || '').toLowerCase().includes(q),
    )
  }, [customers, search])

  return (
    <AdminLayout 
      title="Customers"
      subtitle="Your clients and their cases, orders, and invoices in the customer portal."
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
            id="customers-search"
            className="list-search-input"
            type="search"
            placeholder="Search by name, email, or account…"
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
              <th>Customer</th>
              <th>Email</th>
              <th>Account</th>
              <th>Portal Login</th>
              <th className="text-center">Open Cases</th>
              <th className="text-center">Orders</th>
              <th className="text-center">Invoices</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="table-empty">
                  <span className="material-symbols-outlined spin" style={{ fontSize: 28, color: 'var(--color-primary)' }}>progress_activity</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)', display: 'block', marginBottom: 8 }}>inbox</span>
                  No customers found
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="data-table-row" onClick={() => navigate(`/customers/${c.id}`)}>
                  <td className="table-cell-subject">{c.display_name}</td>
                  <td className="table-cell-muted">{c.email || '—'}</td>
                  <td className="table-cell-muted">{c.account_name || '—'}</td>
                  <td>
                    <span className={`table-badge ${c.portal_user?.is_active ? 'badge-green' : c.portal_enabled ? 'badge-blue' : 'badge-gray'}`}>
                      {portalLoginLabel(c)}
                    </span>
                  </td>
                  <td className="text-center font-medium">{c.open_cases}</td>
                  <td className="text-center font-medium">{c.orders_count}</td>
                  <td className="text-center font-medium">{c.invoices_count}</td>
                  <td>
                    <Link className="table-action-link" to={`/customers/${c.id}`} onClick={(e) => e.stopPropagation()}>
                      View
                    </Link>
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
