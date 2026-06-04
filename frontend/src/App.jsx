import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import AccountSetupSuccessPage from './pages/auth/AccountSetupSuccessPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoginPage from './pages/auth/LoginPage'
import MagicLinkPage from './pages/auth/MagicLinkPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import SetupAccountPage from './pages/auth/SetupAccountPage'
import CaseDetailPage from './pages/CaseDetailPage'
import CasesListPage from './pages/CasesListPage'
import CreateCasePage from './pages/CreateCasePage'
import DashboardPage from './pages/DashboardPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import InvoicesListPage from './pages/InvoicesListPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersListPage from './pages/OrdersListPage'
import ProfilePage from './pages/ProfilePage'
import SecuritySettingsPage from './pages/SecuritySettingsPage'

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<MagicLinkPage />} path="/auth/magic-link" />
      <Route element={<ForgotPasswordPage />} path="/auth/forgot-password" />
      <Route element={<ResetPasswordPage />} path="/auth/reset-password" />
      <Route element={<SetupAccountPage />} path="/auth/setup-account" />
      <Route element={<AccountSetupSuccessPage />} path="/auth/account-setup-success" />

      <Route
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
        path="/dashboard"
      />
      <Route element={<ProtectedRoute><CasesListPage /></ProtectedRoute>} path="/cases" />
      <Route element={<ProtectedRoute><CreateCasePage /></ProtectedRoute>} path="/cases/new" />
      <Route element={<ProtectedRoute><CaseDetailPage /></ProtectedRoute>} path="/cases/:id" />
      <Route element={<ProtectedRoute><OrdersListPage /></ProtectedRoute>} path="/orders" />
      <Route element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} path="/orders/:id" />
      <Route element={<ProtectedRoute><InvoicesListPage /></ProtectedRoute>} path="/invoices" />
      <Route element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} path="/invoices/:id" />
      <Route element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} path="/profile" />
      <Route element={<ProtectedRoute><SecuritySettingsPage /></ProtectedRoute>} path="/security" />

      <Route element={<Navigate replace to="/login" />} path="*" />
    </Routes>
  )
}

export default App
