import { useParams, Link } from 'react-router-dom'
import PortalLayout from '../components/PortalLayout'
import { usePortalItem, formatDate } from '../hooks/usePortalData'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { item: invoice, loading, error } = usePortalItem(id ? `/api/portal/invoices/${id}` : null)

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('portalAccessToken')
      const schema = localStorage.getItem('tenantSchema') || 'tenant_demo'
      const base = import.meta.env.VITE_PORTAL_API_BASE || 'http://localhost:8011'
      const response = await fetch(`${base}/api/portal/invoices/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Schema': schema,
        },
      })
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice?.invoice_number || id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.message || 'Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <PortalLayout title="Invoice">
        <div className="text-center py-xl text-on-surface-variant font-body-md">
          <span className="material-symbols-outlined animate-spin text-[32px] mb-xs">refresh</span>
          <p>Loading invoice details…</p>
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

  const isOverdue = (invoice?.status || '').toLowerCase() === 'overdue'

  return (
    <PortalLayout title={`Invoice ${invoice?.invoice_number || ''}`}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-sm text-secondary">
        <Link to="/invoices" className="flex items-center gap-xs hover:text-primary transition-colors font-label-md text-label-md group">
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Invoices
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="font-label-md text-label-md text-on-surface-variant">Invoice #{invoice?.invoice_number}</span>
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
            Invoice #{invoice?.invoice_number || ''}
            {getStatusBadge(invoice?.status)}
          </h2>
          <p className="font-body-md text-body-md text-secondary mt-xs">View and manage billing summary details for this invoice.</p>
        </div>
        <div className="flex items-center gap-sm">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md bg-surface-container-lowest"
            style={{ height: '36px' }}
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print
          </button>
          <button 
            onClick={downloadPdf}
            className="flex items-center gap-xs px-md py-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-md text-label-md shadow-sm"
            style={{ height: '36px' }}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download PDF
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" style={{ display: 'grid', alignItems: 'start' }}>
        {/* Left Column (Main Details) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* From / To Card */}
          <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl" style={{ display: 'grid' }}>
              <div>
                <h3 className="font-label-md text-label-md text-secondary uppercase mb-sm">From</h3>
                <div className="font-body-lg text-body-lg text-on-surface font-bold mb-xs">Hyegro Corp</div>
                <div className="font-body-md text-body-md text-secondary">
                  123 Tech Boulevard<br/>
                  Suite 400<br/>
                  San Francisco, CA 94105<br/>
                  billing@hyegro.com
                </div>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-secondary uppercase mb-sm">Bill To</h3>
                <div className="font-body-lg text-body-lg text-on-surface font-bold mb-xs">Enterprise Solutions</div>
                <div className="font-body-md text-body-md text-secondary">
                  Attn: Sarah Johnson<br/>
                  890 Corporate Way<br/>
                  Building B<br/>
                  Austin, TX 78701
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low font-label-md text-label-md text-secondary uppercase border-b border-outline-variant">
                  <tr>
                    <th className="py-md px-lg font-medium">Description</th>
                    <th className="py-md px-lg font-medium text-right">Qty</th>
                    <th className="py-md px-lg font-medium text-right">Unit Price</th>
                    <th className="py-md px-lg font-medium text-right">Tax</th>
                    <th className="py-md px-lg font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/30">
                  <tr className="hover:bg-surface-bright transition-colors">
                    <td className="py-md px-lg">
                      <div className="font-bold text-on-surface">Enterprise Licensing & Services Fee</div>
                      <div className="text-secondary text-xs">Standard B2B portal integrations and support package</div>
                    </td>
                    <td className="py-md px-lg text-right font-mono-sm text-mono-sm">1</td>
                    <td className="py-md px-lg text-right font-mono-sm text-mono-sm">
                      {invoice?.currency || '$'}{Number(invoice?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-md px-lg text-right font-mono-sm text-mono-sm">0%</td>
                    <td className="py-md px-lg text-right font-mono-sm text-mono-sm">
                      {invoice?.currency || '$'}{Number(invoice?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="bg-surface-bright p-lg border-t border-outline-variant flex justify-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="w-full max-w-sm flex flex-col gap-xs">
                <div className="flex justify-between py-xs font-body-md text-body-md text-secondary" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface">
                    {invoice?.currency || '$'}{Number(invoice?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-xs font-body-md text-body-md text-secondary" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface">$0.00</span>
                </div>
                <div className="flex justify-between py-sm mt-sm border-t border-outline-variant font-headline-sm text-headline-sm text-on-surface" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '8px' }}>
                  <span>Grand Total</span>
                  <span className={`font-mono-sm text-[20px] font-bold ${isOverdue ? 'text-error' : 'text-primary'}`}>
                    {invoice?.currency || '$'}{Number(invoice?.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Meta Information) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Invoice Meta Card */}
          <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm flex flex-col gap-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '8px' }}>
              Invoice Details
            </h3>
            
            <div className="flex flex-col gap-md" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-body-md text-body-md text-secondary">Invoice Date</span>
                <span className="font-mono-sm text-mono-sm text-on-surface">{formatDate(invoice?.invoice_date)}</span>
              </div>
              
              <div 
                className={`flex justify-between items-center p-sm rounded-lg -mx-sm ${
                  isOverdue ? 'bg-error-container text-on-error-container' : 'bg-surface-container-low text-on-surface'
                }`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}
              >
                <span className="font-body-md text-body-md font-medium flex items-center gap-xs" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined text-[16px]">event_busy</span>
                  Due Date
                </span>
                <span className="font-mono-sm text-mono-sm font-bold">{formatDate(invoice?.due_date)}</span>
              </div>
              
              <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-outline-variant)/30', paddingTop: '8px' }}>
                <span className="font-body-md text-body-md text-secondary">PO Number</span>
                <span className="font-mono-sm text-mono-sm text-on-surface">PO-ES-2024-Q4</span>
              </div>
            </div>
            
            <div className="mt-lg pt-md border-t border-outline-variant" style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
              <button 
                className="w-full bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md py-sm rounded-lg transition-colors flex justify-center items-center gap-xs shadow-sm cursor-pointer"
                style={{ height: '40px' }}
              >
                <span className="material-symbols-outlined text-[18px]">payment</span>
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
