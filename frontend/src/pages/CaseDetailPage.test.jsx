import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import CaseDetailPage from './CaseDetailPage'

vi.mock('../components/PortalLayout', () => ({
  default: ({ children, title }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('../api/portalApi', () => ({
  portalFetch: vi.fn(),
}))

import { portalFetch } from '../api/portalApi'

function renderCaseDetail(caseId = '24') {
  return render(
    <MemoryRouter initialEntries={[`/cases/${caseId}`]}>
      <Routes>
        <Route path="/cases/:id" element={<CaseDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CaseDetailPage', () => {
  beforeEach(() => {
    portalFetch.mockImplementation((path) => {
      if (path.endsWith('/comments')) {
        return Promise.resolve([])
      }
      return Promise.resolve({
        id: 24,
        case_number: 'CASE-00024',
        subject: 'Billing question',
        status: 'Open',
        description: 'Need help with invoice',
        account_name: 'Aayush',
        case_source: 'Portal',
        created_at: '2026-06-11T10:00:00Z',
        updated_at: '2026-06-11T10:00:00Z',
      })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not show placeholder attachment files', async () => {
    renderCaseDetail()

    await waitFor(() => {
      expect(screen.getByText('Billing question')).toBeInTheDocument()
    })

    expect(screen.queryByText('delivery_note.pdf')).not.toBeInTheDocument()
    expect(screen.getByText('No attachments on this case.')).toBeInTheDocument()
  })

  it('shows account name and case source from the API', async () => {
    renderCaseDetail()

    await waitFor(() => {
      expect(screen.getByText('Aayush')).toBeInTheDocument()
    })

    expect(screen.getByText('Portal')).toBeInTheDocument()
  })
})
