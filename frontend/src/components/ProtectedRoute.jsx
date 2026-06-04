import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const token = localStorage.getItem('portalAccessToken')
  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }
  return children
}
