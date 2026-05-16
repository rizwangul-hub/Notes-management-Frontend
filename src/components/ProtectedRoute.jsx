import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, token } = useAuth()
  const location = useLocation()

  if (loading && token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--text)]">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
