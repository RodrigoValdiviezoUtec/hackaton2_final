import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth-context'
import type { AuthStatus } from './auth-context'
import type { LoginRequest, User } from '../types/api'
import { getMe, login as loginRequest } from '../services/auth.service'
import { clearToken, getToken, setToken } from '../services/http'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('initializing')

  // Restauracion de sesion al recargar: si hay JWT guardado, lo validamos con /auth/me.
  useEffect(() => {
    let cancelled = false

    async function restore(): Promise<void> {
      if (!getToken()) {
        if (!cancelled) setStatus('unauthenticated')
        return
      }
      try {
        const me = await getMe()
        if (!cancelled) {
          setUser(me)
          setStatus('authenticated')
        }
      } catch {
        // Token invalido o expirado: limpiamos y exigimos login.
        clearToken()
        if (!cancelled) {
          setUser(null)
          setStatus('unauthenticated')
        }
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginRequest): Promise<void> => {
    const res = await loginRequest(payload)
    setToken(res.token)
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback((): void => {
    clearToken()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
