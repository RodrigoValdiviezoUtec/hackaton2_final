import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getSignalFeed } from '../services/signals.service'
import { getApiErrorMessage } from '../services/http'
import type { Signal, SignalFeedFilters, SignalStatus, SignalType, Severity } from '../types/api'
import { ErrorState, Spinner } from '../components/ui'

const SIGNAL_TYPES: SignalType[] = ['HAMBRE', 'ABANDONO', 'MUTACION', 'FUGA', 'CONFLICTO', 'REPRODUCCION_MASIVA', 'SENAL_CORRUPTA']
const SEVERITIES: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO']
const STATUSES: SignalStatus[] = ['RECIBIDA', 'PROCESANDO', 'ATENDIDA']

function paramsToFilters(sp: URLSearchParams): SignalFeedFilters {
  return {
    signalType: (sp.get('signalType') as SignalType) || undefined,
    severity: (sp.get('severity') as Severity) || undefined,
    status: (sp.get('status') as SignalStatus) || undefined,
    q: sp.get('q') || undefined,
  }
}

export function SignalFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = paramsToFilters(searchParams)
  const navigate = useNavigate()

  const [items, setItems] = useState<Signal[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlightRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  // stable filter key to detect filter changes
  const filterKey = searchParams.toString()

  // reset on filter change
  useEffect(() => {
    abortRef.current?.abort()
    setItems([])
    setCursor(null)
    setHasMore(true)
    setError(null)
    inFlightRef.current = false
  }, [filterKey])

  const loadMore = useCallback(async (currentCursor: string | null, currentFilters: SignalFeedFilters) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    abortRef.current = new AbortController()
    setLoading(true)
    setError(null)
    try {
      const data = await getSignalFeed({ ...currentFilters, cursor: currentCursor ?? undefined, limit: 15 })
      setItems((prev) => {
        const ids = new Set(prev.map((i) => i.id))
        return [...prev, ...data.items.filter((i) => !ids.has(i.id))]
      })
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (err) {
      if (!abortRef.current?.signal.aborted) {
        setError(getApiErrorMessage(err, 'Error al cargar señales'))
      }
    } finally {
      inFlightRef.current = false
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  // initial load
  useEffect(() => {
    void loadMore(null, filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  // intersection observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading && !error) {
        void loadMore(cursor, filters)
      }
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, hasMore, loading, error, filterKey])

  function set(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">Feed de Señales</h1>
          <Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">← Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="Buscar..."
            defaultValue={filters.q ?? ''}
            onKeyDown={(e) => { if (e.key === 'Enter') set('q', (e.target as HTMLInputElement).value || undefined) }}
            onBlur={(e) => set('q', e.target.value || undefined)}
          />
          <FeedSelect label="Tipo" value={filters.signalType ?? ''} onChange={(v) => set('signalType', v || undefined)}
            options={[{ label: 'Todos los tipos', value: '' }, ...SIGNAL_TYPES.map((s) => ({ label: s, value: s }))]} />
          <FeedSelect label="Severidad" value={filters.severity ?? ''} onChange={(v) => set('severity', v || undefined)}
            options={[{ label: 'Todas', value: '' }, ...SEVERITIES.map((s) => ({ label: s, value: s }))]} />
          <FeedSelect label="Estado" value={filters.status ?? ''} onChange={(v) => set('status', v || undefined)}
            options={[{ label: 'Todos', value: '' }, ...STATUSES.map((s) => ({ label: s, value: s }))]} />
        </div>

        {/* Items */}
        {items.map((sig) => (
          <SignalCard key={sig.id} signal={sig} onClick={() => navigate(`/signals/${sig.id}`)} />
        ))}

        {/* Sentinel */}
        <div ref={sentinelRef} />

        {loading && <div className="flex justify-center py-6"><Spinner label="Cargando señales" /></div>}
        {error && <ErrorState message={error} onRetry={() => void loadMore(cursor, filters)} />}
        {!hasMore && !loading && items.length > 0 && (
          <p className="text-center text-xs text-slate-500 py-4">— Fin del feed ({items.length} señales) —</p>
        )}
        {!loading && items.length === 0 && !error && (
          <p className="text-center py-12 text-slate-400">Sin señales con estos filtros</p>
        )}
      </main>
    </div>
  )
}

const SEV_COLOR: Record<string, string> = {
  LEVE: 'text-slate-300', MODERADO: 'text-amber-400', GRAVE: 'text-orange-400', CRITICO: 'text-red-400',
}
const STATUS_COLOR: Record<string, string> = {
  RECIBIDA: 'bg-slate-700 text-slate-200', PROCESANDO: 'bg-amber-500/20 text-amber-300', ATENDIDA: 'bg-emerald-500/20 text-emerald-300',
}

function SignalCard({ signal: s, onClick }: { signal: Signal; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full text-left rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">{s.signalType.replace('_', ' ')}</span>
        <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${STATUS_COLOR[s.status] ?? ''}`}>{s.status}</span>
      </div>
      <p className={`text-xs font-semibold ${SEV_COLOR[s.severity] ?? ''}`}>{s.severity}</p>
      <p className="text-xs text-slate-400 line-clamp-2">{s.rawContent}</p>
      <p className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()}</p>
    </button>
  )
}

function FeedSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}