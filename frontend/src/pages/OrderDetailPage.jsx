import { useParams, Link } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import { usePortalItem, formatDate } from '../hooks/usePortalData'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { item: order, loading, error } = usePortalItem(id ? `/api/portal/orders/${id}` : null)

  if (loading) {
    return (
      <PortalLayout title="Order">
        <div className="text-center py-xl text-on-surface-variant font-body-md">
          <span className="material-symbols-outlined animate-spin text-[32px] mb-xs">refresh</span>
          <p>Loading order details…</p>
        </div>
      </PortalLayout>
    )
  }

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
      <span className={`inline-flex items-center px-sm py-[2px] rounded-full font-label-md text-label-md uppercase tracking-wider ${classes}`}>
        {status || 'UNKNOWN'}
      </span>
    )
  }

  // Active step helper for order tracking progress bar
  const getStepStatus = (stepName) => {
    const s = (order?.status || '').toLowerCase()
    const steps = ['placed', 'confirmed', 'processing', 'shipped', 'delivered']
    const currentIndex = steps.indexOf(s === 'pending' ? 'confirmed' : s)
    const stepIndex = steps.indexOf(stepName)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  // Calculate progress width
  const getProgressWidth = () => {
    const s = (order?.status || '').toLowerCase()
    if (s === 'placed') return '0%'
    if (s === 'pending' || s === 'confirmed') return '25%'
    if (s === 'processing') return '50%'
    if (s === 'shipped') return '75%'
    if (s === 'delivered') return '100%'
    return '50%'
  }

  return (
    <PortalLayout title={`Order ${order?.order_number || ''}`}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-sm text-secondary">
        <Link to="/orders" className="flex items-center gap-xs hover:text-primary transition-colors font-label-md text-label-md group">
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Orders
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="font-label-md text-label-md text-on-surface-variant">Order #{order?.order_number}</span>
      </nav>

      {error ? (
        <div className="bg-error-container text-on-error-container p-md rounded-xl text-sm font-medium">
          {error}
        </div>
      ) : null}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md pb-lg border-b border-outline-variant">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface flex items-center gap-md" style={{ margin: '0' }}>
            Order #{order?.order_number || ''}
            {getStatusBadge(order?.status)}
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-xs">Placed on {formatDate(order?.order_date)}</p>
        </div>
        <div className="flex gap-sm">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors bg-surface-container-lowest"
            style={{ height: '36px' }}
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm" style={{ height: '36px' }}>
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download Invoice
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" style={{ display: 'grid', alignItems: 'start' }}>
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Timeline Card */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Order Status</h2>
            <div className="relative flex items-center justify-between w-full mt-lg mb-sm" style={{ display: 'flex', position: 'relative' }}>
              {/* Progress Line Background */}
              <div 
                className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-high -translate-y-1/2 z-0"
                style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '3px', backgroundColor: 'var(--color-surface-container-high)', zIndex: '0' }}
              />
              {/* Progress Line Active */}
              <div 
                className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                style={{ 
                  position: 'absolute', 
                  top: '20px', 
                  left: '0', 
                  width: getProgressWidth(), 
                  height: '3px', 
                  backgroundColor: 'var(--color-primary)', 
                  zIndex: '0' 
                }}
              />
              
              {/* Steps */}
              {['placed', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                const stepStatus = getStepStatus(step)
                let circleClass = 'bg-surface-container-high text-outline'
                let textClass = 'text-secondary'
                let icon = 'schedule'

                if (stepStatus === 'completed') {
                  circleClass = 'bg-primary text-on-primary'
                  textClass = 'text-on-surface'
                  icon = 'check'
                } else if (stepStatus === 'active') {
                  circleClass = 'bg-primary-container text-primary border-2 border-primary'
                  textClass = 'text-primary font-bold'
                  icon = step === 'processing' ? 'autorenew' : (step === 'shipped' ? 'local_shipping' : 'done_all')
                } else {
                  if (step === 'shipped') icon = 'local_shipping'
                  else if (step === 'delivered') icon = 'inventory_2'
                }

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2 w-1/5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest ${circleClass}`}
                      style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', zIndex: '10', backgroundColor: stepStatus === 'pending' ? 'var(--color-surface-container-high)' : '' }}
                    >
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </div>
                    <span className={`font-label-md text-label-md capitalize ${textClass}`} style={{ fontSize: '11px', marginTop: '4px' }}>{step}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
            <div className="p-lg border-b border-outline-variant">
              <h2 className="font-headline-sm text-headline-sm text-on-surface" style={{ margin: '0' }}>Order Items</h2>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low font-label-md text-label-md text-secondary uppercase border-b border-outline-variant">
                  <tr>
                    <th className="py-3 px-lg font-medium">Product</th>
                    <th className="py-3 px-lg font-medium">SKU</th>
                    <th className="py-3 px-lg font-medium text-right">Qty</th>
                    <th className="py-3 px-lg font-medium text-right">Unit Price</th>
                    <th className="py-3 px-lg font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-body-md text-body-md text-on-surface">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-lg font-bold">Enterprise Server Hardware & Gateway Hub</td>
                    <td className="py-4 px-lg font-mono-sm text-mono-sm text-secondary">SR-GW-9021</td>
                    <td className="py-4 px-lg text-right">1</td>
                    <td className="py-4 px-lg text-right font-mono-sm text-mono-sm">
                      {order?.currency || '$'}{Number(order?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-lg text-right font-mono-sm text-mono-sm font-bold">
                      {order?.currency || '$'}{Number(order?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Details & Summary) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Order Info Card */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant flex flex-col gap-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
              Order Information
            </h2>
            <div className="flex flex-col gap-sm" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/30" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-label-md text-label-md text-secondary uppercase">Order Date</span>
                <span className="font-body-md text-body-md text-on-surface">{formatDate(order?.order_date)}</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/30" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-label-md text-label-md text-secondary uppercase">Expected Delivery</span>
                <span className="font-body-md text-body-md text-on-surface">{formatDate(order?.order_date, 4)}</span>
              </div>
              <div className="flex justify-between items-center py-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-label-md text-label-md text-secondary uppercase">PO Number</span>
                <span className="font-mono-sm text-mono-sm text-on-surface">PO-ES-9901-A</span>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant flex flex-col gap-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
              Order Summary
            </h2>
            <div className="flex flex-col gap-xs mb-sm" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-center text-secondary font-body-md text-body-md" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span className="font-mono-sm text-mono-sm">
                  {order?.currency || '$'}{Number(order?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-secondary font-body-md text-body-md" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping</span>
                <span className="font-mono-sm text-mono-sm">$0.00</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-sm border-t border-outline-variant font-headline-sm text-headline-sm text-on-surface" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '8px' }}>
              <span>Grand Total</span>
              <span className="font-bold font-mono-sm">
                {order?.currency || '$'}{Number(order?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div className="flex flex-col gap-gutter" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant flex flex-col gap-xs">
              <div className="flex items-center gap-xs mb-xs" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                <h3 className="font-label-md text-label-md text-secondary uppercase" style={{ margin: '0' }}>Shipping Address</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed ml-md" style={{ marginLeft: '24px' }}>
                123 Enterprise Way<br/>
                Suite 500<br/>
                New York, NY 10001
              </p>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
