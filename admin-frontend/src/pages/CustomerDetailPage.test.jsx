import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import CustomerDetailPage from './CustomerDetailPage'

const mockDetail = {
  contact: {
    id: 1,
    display_name: 'Jane Doe',
    email: 'jane@example.com',
    account_name: 'Acme Corp',
    portal_enabled: true,
  },
  portal_user: { is_active: true, data_scope: 'own', last_login: null },
  counts: { open_cases: 1, orders: 1, invoices: 1 },
  cases: [{ id: 10, case_number: 'CASE-10', subject: 'Help', status: 'Open', updated_at: '2024-01-01' }],
  orders: [{ id: 20, order_number: 'SO-20', status: 'Confirmed', total_amount: '100.00', currency: 'USD', order_date: '2024-01-02' }],
  invoices: [{ id: 30, invoice_number: 'INV-30', status: 'Open', total_amount: '100.00', currency: 'USD', due_date: '2024-02-01' }],
}

vi.mock('../api/crmClient', () => ({
  fetchCustomerDetail: vi.fn(() => Promise.resolve(mockDetail)),
  disableCustomerPortal: vi.fn(),
  enableCustomerPortal: vi.fn(),
  formatDate: vi.fn((value) => value || '—'),
  downloadDocument: vi.fn(() => Promise.resolve()),
}))

vi.mock('../components/DocumentViewer', () => ({
  default: ({ open, title }) => (open ? <div data-testid="document-viewer">{title}</div> : null),
}))

vi.mock('../components/CaseDetailPanel', () => ({
  default: ({ open, caseNumber }) => (open ? <div data-testid="case-panel">{caseNumber}</div> : null),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/customers/1']}>
      <Routes>
        <Route element={<CustomerDetailPage />} path="/customers/:id" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CustomerDetailPage document actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows view and download actions on invoices tab', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: /jane doe/i })
    await user.click(screen.getByRole('button', { name: /^invoices$/i }))

    expect(screen.getByRole('button', { name: /view invoice inv-30/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download invoice inv-30/i })).toBeInTheDocument()
  })

  it('opens invoice viewer when view is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: /jane doe/i })
    await user.click(screen.getByRole('button', { name: /^invoices$/i }))
    await user.click(screen.getByRole('button', { name: /view invoice inv-30/i }))

    await waitFor(() => {
      expect(screen.getByTestId('document-viewer')).toHaveTextContent('Invoice INV-30')
    })
  })

  it('opens case panel from cases tab', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: /jane doe/i })
    await user.click(screen.getByRole('button', { name: /^cases$/i }))
    await user.click(screen.getByRole('button', { name: /view case case-10/i }))

    await waitFor(() => {
      expect(screen.getByTestId('case-panel')).toHaveTextContent('CASE-10')
    })
  })
})
