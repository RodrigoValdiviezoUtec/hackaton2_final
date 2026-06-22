// Tipos del contrato publico de TropelCare Control API.
// Fuente: docs/indicaciones-backend.md. No inventar campos ni enums.

/** Enums documentados en el contrato (seccion "Valores Permitidos"). */
export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO'

// --- Auth ---

export interface User {
  id: string
  displayName: string
  email: string
  teamCode: string
  /** Documentado: "OPERATOR". Se deja como string para no romper ante otros roles. */
  role: string
}

export interface LoginRequest {
  teamCode: string
  email: string
  password: string
}

/** Respuesta de POST /auth/login. */
export interface LoginResponse {
  token: string
  expiresAt: string
  user: User
}

// --- Dashboard ---

/** Respuesta de GET /dashboard/summary. */
export interface DashboardSummary {
  totalTropels: number
  criticalTropels: number
  openSignals: number
  sectorStabilityAvg: number
  signalsBySeverity: Record<Severity, number>
  generatedAt: string
}

// --- Errores ---

/** Formato unico de error de la API (seccion "Errores"). */
export interface ApiError {
  error: string
  message: string
  timestamp: string
  path: string
  details: Record<string, unknown>
}
