import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'

function renderWithRoute(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Customer Portal routing', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('tenantSchema', 'tenant_demo')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders login page by default', () => {
    renderWithRoute('/login')
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('redirects protected routes to login when unauthenticated', () => {
    renderWithRoute('/dashboard')
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('allows authenticated navigation to dashboard', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@example.com',
        account_name: 'Demo Co',
      }),
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })
    localStorage.setItem('portalAccessToken', 'token')
    localStorage.setItem('tenantSchema', 'tenant_demo')
    renderWithRoute('/dashboard')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })
  })

  it('logs in through login form and shows dashboard', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: 'at', refresh_token: 'rt' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          first_name: 'Demo',
          last_name: 'User',
          email: 'demo@example.com',
          account_name: 'Demo Co',
        }),
      })
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      })
    renderWithRoute('/login')
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'demo@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })
  })

  it('renders cases list screen', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ first_name: 'Demo', last_name: 'User', email: 'demo@example.com' }),
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })
    localStorage.setItem('portalAccessToken', 'token')
    localStorage.setItem('tenantSchema', 'tenant_demo')
    renderWithRoute('/cases')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /support cases/i })).toBeInTheDocument()
    })
  })

  it('renders create case screen', () => {
    localStorage.setItem('portalAccessToken', 'token')
    renderWithRoute('/cases/new')
    expect(screen.getByRole('heading', { name: /create new case/i })).toBeInTheDocument()
  })

  it('renders invoices page', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ first_name: 'Demo', last_name: 'User', email: 'demo@example.com' }),
    })
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })
    localStorage.setItem('portalAccessToken', 'token')
    localStorage.setItem('tenantSchema', 'tenant_demo')
    renderWithRoute('/invoices')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /invoices/i })).toBeInTheDocument()
    })
  })
})
