import { Link } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import StatCard from '../components/StatCard'
import { usePortalList, formatDate } from '../hooks/usePortalData'

export default function DashboardPage() {
  const { items: cases, loading: casesLoading, error: casesError } = usePortalList('/api/portal/cases')
  const { items: orders, loading: ordersLoading } = usePortalList('/api/portal/orders')
  const { items: invoices } = usePortalList('/api/portal/invoices')

  const openCases = cases.filter((c) => (c.status || '').toLowerCase() !== 'closed')
  const unpaidTotal = invoices
    .filter((i) => (i.status || '').toLowerCase() !== 'paid')
    .reduce((sum, i) => sum + Number(i.total_amount || 0), 0)

  // Status Badge styling helper
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
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${classes}`}>
        {status}
      </span>
    )
  }

  return (
    <PortalLayout title="Dashboard">
      {casesError ? (
        <div className="bg-error-container text-on-error-container p-md rounded-xl text-sm font-medium">
          {casesError}
        </div>
      ) : null}

      {/* Welcome Section */}
      <section className="flex flex-col gap-xs mb-sm">
        <h2 className="font-display-lg text-display-lg text-on-surface">Welcome back, Sarah</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Here's what's happening with your account today.</p>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard label="Open Cases" value={casesLoading ? '…' : openCases.length} testId="open-cases-card" />
        <StatCard label="Pending Orders" value={ordersLoading ? '…' : orders.length} testId="pending-orders-card" />
        <StatCard label="Unpaid Invoices" value={`$${unpaidTotal.toFixed(2)}`} testId="unpaid-invoices-card" />
        <StatCard label="Total Cases" value={casesLoading ? '…' : cases.length} testId="orders-month-card" />
      </section>

      {/* Data Tables Bento (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-start" style={{ display: 'grid', alignItems: 'start' }}>
        {/* Recent Cases Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-md border-b border-outline-variant bg-surface-bright" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Cases</h3>
            <Link to="/cases" className="font-label-md text-label-md text-primary hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container font-label-md text-label-md text-on-surface-variant uppercase border-b border-outline-variant">
                  <th className="py-sm px-md font-medium">Case Number</th>
                  <th className="py-sm px-md font-medium">Subject</th>
                  <th className="py-sm px-md font-medium">Status</th>
                  <th className="py-sm px-md font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
                {casesLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-md text-on-surface-variant">Loading cases…</td>
                  </tr>
                ) : (
                  cases.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-sm px-md">
                        <Link to={`/cases/${item.id}`} className="font-mono-sm text-mono-sm text-primary hover:underline">
                          {item.case_number}
                        </Link>
                      </td>
                      <td className="py-sm px-md text-on-surface truncate max-w-[150px]">{item.subject}</td>
                      <td className="py-sm px-md">{getStatusBadge(item.status)}</td>
                      <td className="py-sm px-md text-on-surface-variant">{formatDate(item.updated_at)}</td>
                    </tr>
                  ))
                )}
                {!casesLoading && cases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-md text-on-surface-variant">No cases yet</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Orders Section */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-md border-b border-outline-variant bg-surface-bright" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Orders</h3>
            <Link to="/orders" className="font-label-md text-label-md text-primary hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container font-label-md text-label-md text-on-surface-variant uppercase border-b border-outline-variant">
                  <th className="py-sm px-md font-medium">Order Number</th>
                  <th className="py-sm px-md font-medium">Date</th>
                  <th className="py-sm px-md font-medium">Status</th>
                  <th className="py-sm px-md font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
                {ordersLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-md text-on-surface-variant">Loading orders…</td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-sm px-md">
                        <Link to={`/orders/${item.id}`} className="font-mono-sm text-mono-sm text-primary hover:underline">
                          {item.order_number}
                        </Link>
                      </td>
                      <td className="py-sm px-md text-on-surface">{formatDate(item.order_date)}</td>
                      <td className="py-sm px-md">{getStatusBadge(item.status)}</td>
                      <td className="py-sm px-md text-on-surface font-medium">
                        {item.currency || '$'}{Number(item.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
                {!ordersLoading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-md text-on-surface-variant">No orders yet</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PortalLayout>
  )
}
