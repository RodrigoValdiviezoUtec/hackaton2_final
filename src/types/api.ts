// Tipos del contrato publico de TropelCare Control API.

export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO'
export type VitalState = 'ESTABLE' | 'HAMBRIENTO' | 'AGITADO' | 'MUTANDO' | 'CRITICO'
export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY'
export type SignalType = 'HAMBRE' | 'ABANDONO' | 'MUTACION' | 'FUGA' | 'CONFLICTO' | 'REPRODUCCION_MASIVA' | 'SENAL_CORRUPTA'
export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA'
export type SortOption = 'name,asc' | 'updatedAt,desc' | 'chaosIndex,desc'

export interface User {
  id: string
  displayName: string
  email: string
  teamCode: string
  role: string
}

export interface LoginRequest {
  teamCode: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  user: User
}

export interface DashboardSummary {
  totalTropels: number
  criticalTropels: number
  openSignals: number
  sectorStabilityAvg: number
  signalsBySeverity: Record<Severity, number>
  generatedAt: string
}

export interface ApiError {
  error: string
  message: string
  timestamp: string
  path: string
  details: Record<string, unknown>
}

// --- Tropeles ---

export interface TropelSector {
  id: string
  name: string
  sectorCode: string
}

export interface Tropel {
  id: string
  name: string
  species: Species
  vitalState: VitalState
  energyLevel: number
  chaosIndex: number
  mutationStage: number
  guardianName: string
  sector: TropelSector
  createdAt: string
  updatedAt: string
}

export interface TropelPage {
  content: Tropel[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface TropelFilters {
  page: number
  size: 10 | 20 | 50
  species?: Species
  vitalState?: VitalState
  sectorId?: string
  q?: string
  sort?: SortOption
}

// --- Sectores ---

export interface Sector {
  id: string
  sectorCode: string
  name: string
  climate: string
  capacity: number
  currentLoad: number
  stabilityLevel: number
  updatedAt: string
}

export interface SectorStoryStage {
  id: string
  order: number
  title: string
  narrative: string
  dominantEvent: string
  metrics: {
    stability: number
    energy: number
    alerts: number
    [key: string]: number
  }
  assetKey: string
  colorToken: string
  progress: number
}

export interface SectorStoryResponse {
  sector: {
    id: string
    name: string
    climate: string
  }
  stages: SectorStoryStage[]
}

// --- Signals ---

export interface Signal {
  id: string
  tropelId: string
  signalType: SignalType
  severity: Severity
  status: SignalStatus
  rawContent: string
  createdAt: string
  updatedAt: string
  tropel?: {
    id: string
    name: string
    species: Species
  }
}

export interface SignalFeedResponse {
  items: Signal[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate: number
}

export interface SignalFeedFilters {
  signalType?: SignalType
  severity?: Severity
  status?: SignalStatus
  q?: string
}