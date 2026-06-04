import { Navigate, useLocation } from 'react-router-dom'

import { getCrmToken } from '../api/crmClient'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  if (!getCrmToken()) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }
  return children
}
