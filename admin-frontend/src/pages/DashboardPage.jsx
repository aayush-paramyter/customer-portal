import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchCustomers, fetchDashboardMetrics, formatDate } from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState(null)
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchDashboardMetrics(), fetchCustomers()])
      .then(([m, list]) => {
        setMetrics(m)
        setCustomers(Array.isArray(list) ? list : [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const engagementRows = useMemo(() => {
    return [...customers]
      .filter((c) => c.portal_enabled || c.portal_user)
      .sort((a, b) => {
        const aTime = a.portal_user?.last_login ? new Date(a.portal_user.last_login).getTime() : 0
        const bTime = b.portal_user?.last_login ? new Date(b.portal_user.last_login).getTime() : 0
        return bTime - aTime
      })
      .slice(0, 10)
  }, [customers])

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center py-2xl">
          <span className="material-symbols-outlined spin text-[40px]" style={{ color: 'var(--color-primary)' }}>progress_activity</span>
          <p className="text-body-md text-on-surface-variant mt-sm">Loading dashboard metrics...</p>
        </div>
      </AdminLayout>
    )
  }

  const totals = metrics?.totals || {}
  const engagement = metrics?.engagement || {}

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Business metrics, portal engagement activity, and recent customer accesses."
    >
      {error && (
        <div className="alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Business Overview Stats */}
      <div>
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-md">Business Overview</h3>
        <div className="invoice-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="invoice-stat-card cursor-pointer" onClick={() => navigate('/customers')}>
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Customers</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px]">group</span>
            </div>
            <span className="invoice-stat-value">{totals.customers ?? 0}</span>
            <span className="invoice-stat-sub">Registered accounts</span>
          </div>

          <div className="invoice-stat-card cursor-pointer" onClick={() => navigate('/cases')}>
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Open Cases</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px] text-primary">support_agent</span>
            </div>
            <span className="invoice-stat-value">{totals.open_cases ?? 0}</span>
            <span className="invoice-stat-sub">Active support requests</span>
          </div>

          <div className="invoice-stat-card cursor-pointer" onClick={() => navigate('/orders')}>
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Orders</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px]">shopping_cart</span>
            </div>
            <span className="invoice-stat-value">{totals.orders ?? 0}</span>
            <span className="invoice-stat-sub">Placed sales orders</span>
          </div>

          <div className="invoice-stat-card cursor-pointer" onClick={() => navigate('/invoices')}>
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Unpaid Invoices</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px]" style={{ color: 'var(--color-tertiary)' }}>receipt_long</span>
            </div>
            <span className="invoice-stat-value">{totals.unpaid_invoices ?? 0}</span>
            <span className="invoice-stat-sub">Pending customer payments</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="flex flex-wrap gap-sm my-xs bg-surface-container-low p-md rounded-xl border border-outline-variant">
        <Link className="btn-primary" to="/cases">
          <span className="material-symbols-outlined mr-sm" style={{ fontSize: 18 }}>support_agent</span>
          Manage Cases
        </Link>
        <Link className="btn-outline" to="/orders">
          <span className="material-symbols-outlined mr-sm" style={{ fontSize: 18 }}>shopping_cart</span>
          View Orders
        </Link>
        <Link className="btn-outline" to="/invoices">
          <span className="material-symbols-outlined mr-sm" style={{ fontSize: 18 }}>receipt_long</span>
          Manage Invoices
        </Link>
        <Link className="btn-outline" to="/customers">
          <span className="material-symbols-outlined mr-sm" style={{ fontSize: 18 }}>group</span>
          Customers Directory
        </Link>
      </div>

      {/* Customer Portal Engagement Stats */}
      <div>
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-md">Customer Portal Engagement</h3>
        <div className="invoice-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="invoice-stat-card">
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Portal Enabled</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px]">vpn_key</span>
            </div>
            <span className="invoice-stat-value">{engagement.portal_enabled ?? 0}</span>
            <span className="invoice-stat-sub">Customers with login set up</span>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Active Logins</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px] text-green">verified_user</span>
            </div>
            <span className="invoice-stat-value">{engagement.active_portal_users ?? 0}</span>
            <span className="invoice-stat-sub">Active login credentials</span>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Never Logged In</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px] text-outline">history</span>
            </div>
            <span className="invoice-stat-value">{engagement.never_signed_in ?? 0}</span>
            <span className="invoice-stat-sub">Registered, never accessed</span>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-header">
              <span className="invoice-stat-label">Active (7d)</span>
              <span className="material-symbols-outlined invoice-stat-icon text-[24px]">login</span>
            </div>
            <span className="invoice-stat-value">{engagement.signed_in_last_7_days ?? 0}</span>
            <span className="invoice-stat-sub">Signed in within 7 days</span>
          </div>
        </div>
      </div>

      {/* Two Columns for Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-sm">
        {/* Recent Portal Sign-ins */}
        <div className="flex flex-col gap-sm">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Portal Sign-ins</h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Last Sign-In</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(metrics?.recent_portal_logins || []).map((row) => (
                  <tr key={`${row.contact_id}-${row.last_login}`} className="data-table-row" onClick={() => row.contact_id && navigate(`/customers/${row.contact_id}`)}>
                    <td className="table-cell-subject">
                      {row.display_name}
                      <span className="block text-xs text-on-surface-variant font-normal">{row.email || '—'}</span>
                    </td>
                    <td className="table-cell-muted text-xs">{formatDate(row.last_login)}</td>
                    <td>
                      <span className={`table-badge ${row.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {row.contact_id ? (
                        <Link to={`/customers/${row.contact_id}`} className="table-action-link" onClick={(e) => e.stopPropagation()}>
                          View
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {!metrics?.recent_portal_logins?.length ? (
                  <tr>
                    <td colSpan={4} className="table-empty">No portal sign-ins yet</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portal-Enabled Customers */}
        <div className="flex flex-col gap-sm">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Portal-Enabled Customers</h3>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Last Access</th>
                  <th>Portal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {engagementRows.map((c) => (
                  <tr key={c.id} className="data-table-row" onClick={() => navigate(`/customers/${c.id}`)}>
                    <td className="table-cell-subject">
                      {c.display_name}
                      <span className="block text-xs text-on-surface-variant font-normal">{c.email || '—'}</span>
                    </td>
                    <td className="table-cell-muted text-xs">
                      {c.portal_user?.last_login ? formatDate(c.portal_user.last_login) : 'Never'}
                    </td>
                    <td>
                      <span className={`table-badge ${c.portal_user?.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {c.portal_user?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/customers/${c.id}`} className="table-action-link" onClick={(e) => e.stopPropagation()}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {!engagementRows.length ? (
                  <tr>
                    <td colSpan={4} className="table-empty">No customers with portal access yet</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
