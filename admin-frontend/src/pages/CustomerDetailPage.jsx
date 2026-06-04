import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  disableCustomerPortal,
  downloadDocument,
  enableCustomerPortal,
  fetchCustomerDetail,
  formatDate,
} from '../api/crmClient'
import AdminLayout from '../components/AdminLayout'
import CaseDetailPanel from '../components/CaseDetailPanel'
import DocumentViewer from '../components/DocumentViewer'
import RecordActions from '../components/RecordActions'

const TABS = ['overview', 'cases', 'orders', 'invoices', 'portal']

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [tab, setTab] = useState('overview')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [dataScope, setDataScope] = useState('own')
  const [saving, setSaving] = useState(false)
  const [documentViewer, setDocumentViewer] = useState(null)
  const [casePanel, setCasePanel] = useState(null)
  const [actionError, setActionError] = useState('')

  const load = () => {
    setLoading(true)
    fetchCustomerDetail(id)
      .then((data) => {
        setDetail(data)
        setDataScope(data.portal_user?.data_scope || 'own')
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id])

  const enablePortal = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await enableCustomerPortal(id, { password, dataScope })
      setPassword('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const disablePortal = async () => {
    setSaving(true)
    setError('')
    try {
      await disableCustomerPortal(id)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openDocument = (type, record, label) => {
    setActionError('')
    setDocumentViewer({
      type,
      id: record.id,
      title: label,
    })
  }

  const downloadRecord = async (type, record, label) => {
    setActionError('')
    try {
      const filename = type === 'attachment' ? label : `${label}.pdf`
      await downloadDocument(type, record.id, filename)
    } catch (err) {
      setActionError(err.message || 'Download failed')
    }
  }

  const openCase = (caseRecord) => {
    setActionError('')
    setCasePanel({
      id: caseRecord.id,
      caseNumber: caseRecord.case_number,
    })
  }

  if (loading && !detail) {
    return (
      <AdminLayout title="Customer Detail">
        <div className="flex flex-col items-center justify-center py-2xl">
          <span className="material-symbols-outlined spin text-[40px]" style={{ color: 'var(--color-primary)' }}>progress_activity</span>
          <p className="text-body-md text-on-surface-variant mt-sm">Loading customer information...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!detail) {
    return (
      <AdminLayout 
        title="Customer Not Found"
        breadcrumb={
          <>
            <Link to="/customers">Customers</Link>
            <span className="page-breadcrumb-sep">/</span>
            <span>Error</span>
          </>
        }
      >
        <div className="alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{error || 'The requested customer was not found.'}</span>
        </div>
        <Link className="btn-outline" to="/customers">
          <span className="material-symbols-outlined mr-sm" style={{ fontSize: 18 }}>arrow_back</span>
          Back to Customers
        </Link>
      </AdminLayout>
    )
  }

  const { contact, counts } = detail

  return (
    <AdminLayout 
      title={contact.display_name}
      subtitle={`Manage portal access, view cases, invoices, and purchase orders for ${contact.account_name || 'this customer'}.`}
      breadcrumb={
        <>
          <Link to="/customers">Customers</Link>
          <span className="page-breadcrumb-sep">/</span>
          <span>{contact.display_name}</span>
        </>
      }
    >
      {error && (
        <div className="alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {actionError && (
        <div className="alert-error" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap gap-xs mb-sm border-b border-outline-variant pb-xs">
        {TABS.map((t) => (
          <button
            key={t}
            className={tab === t ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
            onClick={() => setTab(t)}
            type="button"
            style={{ borderRadius: '8px 8px 0 0', height: '36px' }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-lg">
          <div className="invoice-stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="invoice-stat-card">
              <div className="invoice-stat-header">
                <span className="invoice-stat-label">Open Cases</span>
                <span className="material-symbols-outlined invoice-stat-icon text-[24px] text-primary">support_agent</span>
              </div>
              <span className="invoice-stat-value">{counts.open_cases}</span>
              <span className="invoice-stat-sub">Awaiting resolution</span>
            </div>

            <div className="invoice-stat-card">
              <div className="invoice-stat-header">
                <span className="invoice-stat-label">Orders Placed</span>
                <span className="material-symbols-outlined invoice-stat-icon text-[24px]">shopping_cart</span>
              </div>
              <span className="invoice-stat-value">{counts.orders}</span>
              <span className="invoice-stat-sub">Sales orders count</span>
            </div>

            <div className="invoice-stat-card">
              <div className="invoice-stat-header">
                <span className="invoice-stat-label">Invoices</span>
                <span className="material-symbols-outlined invoice-stat-icon text-[24px]">receipt_long</span>
              </div>
              <span className="invoice-stat-value">{counts.invoices}</span>
              <span className="invoice-stat-sub">Total billed invoices</span>
            </div>
          </div>

          <div className="form-card">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-md">Contact Information</h3>
            <div className="form-row-2">
              <div className="form-group">
                <span className="font-label-md text-label-md text-outline">Full Name</span>
                <span className="font-body-lg text-body-lg font-medium text-on-surface">{contact.display_name}</span>
              </div>
              <div className="form-group">
                <span className="font-label-md text-label-md text-outline">Email Address</span>
                <span className="font-body-lg text-body-lg font-medium text-on-surface">{contact.email || '—'}</span>
              </div>
              <div className="form-group">
                <span className="font-label-md text-label-md text-outline">Account / Company</span>
                <span className="font-body-lg text-body-lg font-medium text-on-surface">{contact.account_name || '—'}</span>
              </div>
              <div className="form-group">
                <span className="font-label-md text-label-md text-outline">Portal Setup</span>
                <div>
                  <span className={`table-badge ${contact.portal_enabled && detail.portal_user?.is_active ? 'badge-green' : 'badge-gray'}`}>
                    {contact.portal_enabled && detail.portal_user?.is_active ? 'Active Portal' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'cases' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {detail.cases.map((c) => (
                <tr key={c.id}>
                  <td className="table-link">{c.case_number}</td>
                  <td className="table-cell-subject">{c.subject}</td>
                  <td>
                    <span className={`table-badge ${
                      c.status === 'Open' || c.status === 'In Progress' ? 'badge-blue' : 'badge-gray'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="table-cell-muted">{formatDate(c.updated_at)}</td>
                  <td>
                    <button
                      aria-label={`View case ${c.case_number}`}
                      className="btn-ghost btn-sm record-action-btn"
                      onClick={() => openCase(c)}
                      type="button"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">visibility</span>
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!detail.cases.length ? (
                <tr>
                  <td colSpan={5} className="table-empty">No support cases found for this customer</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {detail.orders.map((o) => (
                <tr key={o.id}>
                  <td className="table-link">{o.order_number}</td>
                  <td>
                    <span className="table-badge badge-teal">{o.status}</span>
                  </td>
                  <td className="table-cell-amount">{o.currency} {parseFloat(o.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="table-cell-muted">{formatDate(o.order_date)}</td>
                  <td>
                    <RecordActions
                      downloadAriaLabel={`Download order ${o.order_number}`}
                      onView={() => openDocument('order', o, `Order ${o.order_number}`)}
                      onDownload={() => downloadRecord('order', o, `Order ${o.order_number}`)}
                      viewAriaLabel={`View order ${o.order_number}`}
                    />
                  </td>
                </tr>
              ))}
              {!detail.orders.length ? (
                <tr>
                  <td colSpan={5} className="table-empty">No sales orders found for this customer</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {detail.invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="table-link">{inv.invoice_number}</td>
                  <td>
                    <span className={`table-badge ${inv.status === 'Paid' ? 'badge-green' : 'badge-orange'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="table-cell-amount">{inv.currency} {parseFloat(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="table-cell-muted">{formatDate(inv.due_date)}</td>
                  <td>
                    <RecordActions
                      downloadAriaLabel={`Download invoice ${inv.invoice_number}`}
                      onView={() => openDocument('invoice', inv, `Invoice ${inv.invoice_number}`)}
                      onDownload={() => downloadRecord('invoice', inv, `Invoice ${inv.invoice_number}`)}
                      viewAriaLabel={`View invoice ${inv.invoice_number}`}
                    />
                  </td>
                </tr>
              ))}
              {!detail.invoices.length ? (
                <tr>
                  <td colSpan={5} className="table-empty">No invoices found for this customer</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'portal' && (
        <div className="form-card max-w-[600px]">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-md">Customer Portal Control</h3>
          <div className="flex items-center justify-between mb-lg p-md bg-surface-container-low rounded-xl border border-outline-variant">
            <div>
              <span className="block font-label-md text-label-md text-outline">Access Status</span>
              <strong className={contact.portal_enabled && detail.portal_user?.is_active ? 'text-primary' : 'text-outline'}>
                {contact.portal_enabled && detail.portal_user?.is_active ? 'Enabled' : 'Disabled'}
              </strong>
            </div>
            {detail.portal_user?.last_login && (
              <div className="text-right">
                <span className="block font-label-md text-label-md text-outline">Last Login</span>
                <span className="text-body-md text-on-surface-variant font-medium">{formatDate(detail.portal_user.last_login)}</span>
              </div>
            )}
          </div>

          {contact.portal_enabled && detail.portal_user?.is_active ? (
            <div className="flex flex-col gap-md">
              <div className="form-group">
                <span className="font-label-md text-label-md text-outline">Configured Data Scope</span>
                <span className="font-body-md text-on-surface font-semibold">
                  {detail.portal_user?.data_scope === 'own' ? 'Own records only' : 'Full account records'}
                </span>
              </div>
              <button 
                className="btn-outline w-full flex items-center justify-center gap-xs" 
                style={{ color: 'var(--color-error)' }}
                disabled={saving} 
                onClick={disablePortal} 
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">no_accounts</span>
                Disable customer portal access
              </button>
            </div>
          ) : (
            <form onSubmit={enablePortal} className="flex flex-col gap-md">
              <div className="form-group">
                <label className="form-label" htmlFor="dataScope">Data Scope Scope</label>
                <div className="form-select-wrap">
                  <select 
                    id="dataScope" 
                    className="form-select"
                    value={dataScope} 
                    onChange={(e) => setDataScope(e.target.value)}
                  >
                    <option value="own">Own records only</option>
                    <option value="account">Full account</option>
                  </select>
                  <span className="material-symbols-outlined form-select-icon">expand_more</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="initialPassword">Initial Password (Optional)</label>
                <input
                  id="initialPassword"
                  className="form-input"
                  placeholder="Leave blank to set later"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                className="btn-primary w-full flex items-center justify-center gap-xs mt-sm" 
                disabled={saving} 
                type="submit"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined spin text-[20px]">progress_activity</span>
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                    <span>Enable Portal Login</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {documentViewer ? (
        <DocumentViewer
          id={documentViewer.id}
          open
          title={documentViewer.title}
          type={documentViewer.type}
          onClose={() => setDocumentViewer(null)}
        />
      ) : null}

      {casePanel ? (
        <CaseDetailPanel
          caseId={casePanel.id}
          caseNumber={casePanel.caseNumber}
          open
          onClose={() => setCasePanel(null)}
        />
      ) : null}
    </AdminLayout>
  )
}
