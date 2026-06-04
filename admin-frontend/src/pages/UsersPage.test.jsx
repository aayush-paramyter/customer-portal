import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

import * as crmClient from '../api/crmClient'
import UsersPage from './UsersPage'

vi.mock('../api/crmClient', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    fetchCrmUsers: vi.fn(),
    fetchPortalAdmins: vi.fn(),
    togglePortalAdmin: vi.fn(),
    clearCrmSession: vi.fn(),
  }
})

describe('UsersPage', () => {
  beforeEach(() => {
    localStorage.setItem('crmAccessToken', 'token')
    crmClient.fetchCrmUsers.mockResolvedValue([
      { id: 1, username: 'jane@tenant', email: 'jane@co.com', role: 'user', first_name: 'Jane' },
      { id: 2, username: 'admin@tenant', email: 'admin@co.com', role: 'system_admin' },
    ])
    crmClient.fetchPortalAdmins.mockResolvedValue([{ user_id: 1 }])
  })

  it('lists CRM users and shows system admin as always', async () => {
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument()
    })
    expect(screen.getByText(/always \(system admin\)/i)).toBeInTheDocument()
  })
})
