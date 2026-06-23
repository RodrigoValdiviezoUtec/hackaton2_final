import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDashboardSummary } from '../services/dashboard.service'
import { getSectors } from '../services/sectors.service'
import { getApiErrorMessage } from '../services/http'
import type { DashboardSummary, Sector, Severity } from '../types/api'
import { EmptyState, ErrorState, Spinner } from '../components/ui'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; data: DashboardSummary; sectors: Sector[] }

const SEVERITY_ORDER: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO']

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [state, setState] = useState<LoadState>({ phase: 'loading' })

  const load = useCallback(async (signal: AbortSignal): Promise<void> => {
    setState({ phase: 'loading' })
    try {
      const [data, sectors] = await Promise.all([
        getDashboardSummary(),
        getSectors(),
      ])
      if (!signal.aborted) setState({ phase: 'ready', data, sectors })
    } catch (err) {
      if (!signal.aborted) {
        setState({ phase: 'error', message: getApiErrorMessage(err, 'No se pudo cargar el dashboard.') })
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const retry = useCallback(() => {
    const controller = new AbortController()
    void load(controller.signal)
  }, [load])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">TropelCare Control Room</h1>
            {user && (
              <p className="text-sm text-slate-400">
                {user.displayName} · {user.teamCode}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {state.phase === 'loading' && (
          <div className="flex justify-center py-16">
            <Spinner label="Cargando dashboard" />
          </div>
        )}

        {state.phase === 'error' && <ErrorState message={state.message} onRetry={retry} />}

        {state.phase === 'ready' && <SummaryView data={state.data} sectors={state.sectors} />}
      </main>
    </div>
  )
}

function SummaryView({ data, sectors }: { data: DashboardSummary; sectors: Sector[] }) {
  const navigate = useNavigate()
  const totalSignals = SEVERITY_ORDER.reduce(
    (acc, sev) => acc + (data.signalsBySeverity[sev] ?? 0),
    0,
  )

  // Estado vacio: el workspace no tiene datos sembrados todavia.
  if (data.totalTropels === 0 && totalSignals === 0) {
    return (
      <EmptyState title="Sin datos en este workspace">
        Aun no hay Tropeles ni Senales registradas para tu equipo.
      </EmptyState>
    )
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Tropeles totales" value={data.totalTropels} />
        <Kpi label="Tropeles criticos" value={data.criticalTropels} accent="red" />
        <Kpi label="Senales abiertas" value={data.openSignals} accent="amber" />
        <Kpi label="Estabilidad media" value={`${data.sectorStabilityAvg}%`} accent="emerald" />
      </section>

      {/* Navegación de Consola */}
      <section className="flex gap-3">
        <Link to="/tropels"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors">
          Atlas de Tropeles →
        </Link>
        <Link to="/signals"
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors">
          Feed de Señales →
        </Link>
      </section>

      {/* Severidades */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">
          Senales por severidad
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SEVERITY_ORDER.map((sev) => (
            <Kpi key={sev} label={sev} value={data.signalsBySeverity[sev] ?? 0} />
          ))}
        </div>
      </section>

      {/* Sectores (Resumen) */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          Sectores de la Colonia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectors.map((sec) => (
            <div key={sec.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between gap-4 hover:border-slate-750 transition-colors shadow-lg">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100">{sec.name}</h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">{sec.sectorCode}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Clima: <code className="text-emerald-400 font-mono text-[10px]">{sec.climate.replace('_', ' ')}</code></p>
                
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-300">
                  <div>Estabilidad: <strong className={sec.stabilityLevel > 70 ? 'text-emerald-450' : sec.stabilityLevel > 40 ? 'text-amber-450' : 'text-rose-450'}>{sec.stabilityLevel}%</strong></div>
                  <div>Carga: <span className="font-semibold">{sec.currentLoad}</span> / {sec.capacity}</div>
                </div>
              </div>
              <div className="border-t border-slate-800/80 pt-3 flex justify-end">
                <Link
                  to={`/sectors/${sec.id}/story`}
                  onClick={(e) => {
                    // Soporte de View Transition API
                    if (document.startViewTransition) {
                      e.preventDefault()
                      document.startViewTransition(() => {
                        navigate(`/sectors/${sec.id}/story`)
                      })
                    }
                  }}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Ver Bitácora de Exploración (Scrollytelling) →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-slate-500">
        Generado: {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  )
}

const ACCENT: Record<string, string> = {
  default: 'text-slate-100',
  red: 'text-red-400',
  amber: 'text-amber-400',
  emerald: 'text-emerald-400',
}

function Kpi({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: number | string
  accent?: 'default' | 'red' | 'amber' | 'emerald'
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${ACCENT[accent]}`}>{value}</p>
    </div>
  )
}
