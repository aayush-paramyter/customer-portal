import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import App from './App'

vi.mock('./api/crmClient', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getCrmToken: vi.fn(() => localStorage.getItem('crmAccessToken')),
    fetchCustomers: vi.fn(() => Promise.resolve([])),
    fetchDashboardMetrics: vi.fn(() =>
      Promise.resolve({
        totals: {
          customers: 0,
          cases: 0,
          open_cases: 0,
          orders: 0,
          invoices: 0,
          unpaid_invoices: 0,
        },
        engagement: {
          portal_enabled: 0,
          active_portal_users: 0,
          never_signed_in: 0,
          signed_in_last_7_days: 0,
          signed_in_last_30_days: 0,
        },
        recent_portal_logins: [],
      }),
    ),
    fetchAllCases: vi.fn(() => Promise.resolve([])),
    fetchAllOrders: vi.fn(() => Promise.resolve([])),
    fetchAllInvoices: vi.fn(() => Promise.resolve([])),
    fetchCrmUsers: vi.fn(() => Promise.resolve([])),
    fetchPortalAdmins: vi.fn(() => Promise.resolve([])),
    fetchPortalSettings: vi.fn(() =>
      Promise.resolve({
        auth_method: 'both',
        allow_case_creation: true,
        allow_case_comments: true,
      }),
    ),
    startHyegroSso: vi.fn(),
    loginWithCrmCredentials: vi.fn(),
    clearCrmSession: vi.fn(),
  }
})

describe('Admin Portal routing', () => {
  it('renders login page', () => {
    localStorage.removeItem('crmAccessToken')
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /customer portal admin/i })).toBeInTheDocument()
  })

  it('renders customers page with correct title', async () => {
    localStorage.setItem('crmAccessToken', 'token')
    render(
      <MemoryRouter initialEntries={['/customers']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /^customers$/i })).toBeInTheDocument()
    expect(screen.queryByText(/end customers/i)).not.toBeInTheDocument()
  })

  it('renders user management page', async () => {
    localStorage.setItem('crmAccessToken', 'token')
    render(
      <MemoryRouter initialEntries={['/users']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /user management/i })).toBeInTheDocument()
  })

  it('renders cases page', async () => {
    localStorage.setItem('crmAccessToken', 'token')
    render(
      <MemoryRouter initialEntries={['/cases']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /^cases$/i })).toBeInTheDocument()
  })
})
