import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  // Mientras restauramos la sesion no decidimos: evita un parpadeo a /login al recargar.
  if (status === 'initializing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner label="Restaurando sesion" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
