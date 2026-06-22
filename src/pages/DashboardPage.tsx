import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDashboardSummary } from '../services/dashboard.service'
import { getApiErrorMessage } from '../services/http'
import type { DashboardSummary, Severity } from '../types/api'
import { EmptyState, ErrorState, Spinner } from '../components/ui'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; data: DashboardSummary }

const SEVERITY_ORDER: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO']

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [state, setState] = useState<LoadState>({ phase: 'loading' })

  const load = useCallback(async (signal: AbortSignal): Promise<void> => {
    setState({ phase: 'loading' })
    try {
      const data = await getDashboardSummary()
      if (!signal.aborted) setState({ phase: 'ready', data })
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

        {state.phase === 'ready' && <SummaryView data={state.data} />}
      </main>
    </div>
  )
}

function SummaryView({ data }: { data: DashboardSummary }) {
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
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Tropeles totales" value={data.totalTropels} />
        <Kpi label="Tropeles criticos" value={data.criticalTropels} accent="red" />
        <Kpi label="Senales abiertas" value={data.openSignals} accent="amber" />
        <Kpi label="Estabilidad media" value={`${data.sectorStabilityAvg}%`} accent="emerald" />
      </section>

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
