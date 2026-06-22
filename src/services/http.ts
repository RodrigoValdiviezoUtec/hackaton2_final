import axios from 'axios'
import type { AxiosError } from 'axios'
import type { ApiError } from '../types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL) {
  // No rompemos el build; avisamos en runtime para diagnosticar deploys mal configurados.
  console.warn(
    '[http] VITE_API_BASE_URL no esta definida. Configura tu .env (ver .env.example).',
  )
}

export const http = axios.create({ baseURL })

// --- Persistencia del JWT ---

const TOKEN_KEY = 'tropelcare.jwt'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// Interceptor: inyecta Authorization: Bearer <jwt> cuando hay sesion.
// Las rutas publicas (login) simplemente no llevan token porque aun no existe.
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Extrae un mensaje legible del cuerpo de error estandar de la API. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<Partial<ApiError>>
    return axiosErr.response?.data?.message ?? axiosErr.message ?? fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}
