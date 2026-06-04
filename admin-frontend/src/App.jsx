import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import CallbackPage from './pages/CallbackPage'
import CasesPage from './pages/CasesPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import CustomersListPage from './pages/CustomersListPage'
import DashboardPage from './pages/DashboardPage'
import InvoicesPage from './pages/InvoicesPage'
import LoginPage from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<CallbackPage />} path="/callback" />
      <Route element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} path="/dashboard" />
      <Route element={<ProtectedRoute><CustomersListPage /></ProtectedRoute>} path="/customers" />
      <Route element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} path="/customers/:id" />
      <Route element={<ProtectedRoute><CasesPage /></ProtectedRoute>} path="/cases" />
      <Route element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} path="/orders" />
      <Route element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} path="/invoices" />
      <Route element={<ProtectedRoute><UsersPage /></ProtectedRoute>} path="/users" />
      <Route element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} path="/settings" />
      <Route element={<Navigate replace to="/users" />} path="/portal-users" />
      <Route element={<Navigate replace to="/customers" />} path="/contacts" />
      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  )
}
