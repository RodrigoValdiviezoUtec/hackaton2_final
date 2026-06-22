import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getTropels } from '../services/tropels.service'
import { getSectors } from '../services/sectors.service'
import { getApiErrorMessage } from '../services/http'
import type { Sector, Species, SortOption, Tropel, TropelPage, VitalState } from '../types/api'
import { ErrorState, Spinner } from '../components/ui'

const SIZES = [10, 20, 50] as const
const SPECIES_OPTS: Species[] = ['BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY']
const VITAL_OPTS: VitalState[] = ['ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO']
const SORT_OPTS: { label: string; value: SortOption }[] = [
  { label: 'Nombre A-Z', value: 'name,asc' },
  { label: 'Actualizado', value: 'updatedAt,desc' },
  { label: 'Caos ↓', value: 'chaosIndex,desc' },
]

function paramsToFilters(sp: URLSearchParams) {
  return {
    page: Math.max(0, Number(sp.get('page') ?? 0)),
    size: ([10, 20, 50].includes(Number(sp.get('size'))) ? Number(sp.get('size')) : 10) as 10 | 20 | 50,
    species: (sp.get('species') as Species) || undefined,
    vitalState: (sp.get('vitalState') as VitalState) || undefined,
    sectorId: sp.get('sectorId') || undefined,
    q: sp.get('q') || undefined,
    sort: (sp.get('sort') as SortOption) || undefined,
  }
}

export function TropelsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = paramsToFilters(searchParams)

  const [page, setPage] = useState<{ phase: 'loading' } | { phase: 'error'; msg: string } | { phase: 'ready'; data: TropelPage }>({ phase: 'loading' })
  const [sectors, setSectors] = useState<Sector[]>([])
  const reqRef = useRef(0)

  // load sectors once
  useEffect(() => {
    getSectors().then(setSectors).catch(() => null)
  }, [])

  const load = useCallback(() => {
    const id = ++reqRef.current
    setPage({ phase: 'loading' })
    getTropels(filters)
      .then((data) => { if (reqRef.current === id) setPage({ phase: 'ready', data }) })
      .catch((err) => { if (reqRef.current === id) setPage({ phase: 'error', msg: getApiErrorMessage(err, 'Error al cargar tropeles') }) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()])

  useEffect(() => { load() }, [load])

  function set(key: string, value: string | undefined) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) { next.set(key, value); next.set('page', '0') }
      else { next.delete(key); next.set('page', '0') }
      return next
    })
  }

  function setPage_(n: number) {
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('page', String(n)); return next })
  }

  const totalPages = page.phase === 'ready' ? page.data.totalPages : 0

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">Atlas de Tropeles</h1>
          <Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">← Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="Buscar..."
            defaultValue={filters.q ?? ''}
            onKeyDown={(e) => { if (e.key === 'Enter') set('q', (e.target as HTMLInputElement).value || undefined) }}
            onBlur={(e) => set('q', e.target.value || undefined)}
          />
          <Select label="Especie" value={filters.species ?? ''} onChange={(v) => set('species', v || undefined)}
            options={[{ label: 'Todas', value: '' }, ...SPECIES_OPTS.map((s) => ({ label: s, value: s }))]} />
          <Select label="Estado vital" value={filters.vitalState ?? ''} onChange={(v) => set('vitalState', v || undefined)}
            options={[{ label: 'Todos', value: '' }, ...VITAL_OPTS.map((s) => ({ label: s, value: s }))]} />
          <Select label="Sector" value={filters.sectorId ?? ''} onChange={(v) => set('sectorId', v || undefined)}
            options={[{ label: 'Todos', value: '' }, ...sectors.map((s) => ({ label: s.name, value: s.id }))]} />
          <Select label="Orden" value={filters.sort ?? ''} onChange={(v) => set('sort', v || undefined)}
            options={[{ label: 'Defecto', value: '' }, ...SORT_OPTS.map((o) => ({ label: o.label, value: o.value }))]} />
          <Select label="Por pág." value={String(filters.size)} onChange={(v) => set('size', v)}
            options={SIZES.map((s) => ({ label: String(s), value: String(s) }))} />
        </div>

        {/* Content */}
        {page.phase === 'loading' && <div className="flex justify-center py-16"><Spinner label="Cargando tropeles" /></div>}
        {page.phase === 'error' && <ErrorState message={page.msg} onRetry={load} />}
        {page.phase === 'ready' && (
          <>
            <p className="text-xs text-slate-500">{page.data.totalElements} tropeles encontrados</p>
            {page.data.content.length === 0
              ? <p className="text-center py-12 text-slate-400">Sin resultados</p>
              : <div className="grid gap-3 sm:grid-cols-2">{page.data.content.map((t) => <TropelCard key={t.id} tropel={t} />)}</div>
            }
            <Pagination current={filters.page} total={totalPages} onChange={setPage_} />
          </>
        )}
      </main>
    </div>
  )
}

function TropelCard({ tropel: t }: { tropel: Tropel }) {
  const vitalColor: Record<string, string> = {
    ESTABLE: 'text-emerald-400', HAMBRIENTO: 'text-amber-400',
    AGITADO: 'text-orange-400', MUTANDO: 'text-purple-400', CRITICO: 'text-red-400',
  }
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-medium">{t.name}</span>
        <span className={`text-xs font-semibold ${vitalColor[t.vitalState] ?? ''}`}>{t.vitalState}</span>
      </div>
      <p className="text-xs text-slate-400">{t.species} · {t.sector.name}</p>
      <div className="flex gap-4 text-xs text-slate-400">
        <span>Energía {t.energyLevel}</span>
        <span>Caos {t.chaosIndex}</span>
        <span>Etapa {t.mutationStage}</span>
      </div>
      <p className="text-xs text-slate-500">Guardián: {t.guardianName}</p>
    </div>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (n: number) => void }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2">
      <button disabled={current === 0} onClick={() => onChange(current - 1)}
        className="rounded px-3 py-1 text-sm border border-slate-700 disabled:opacity-40 hover:bg-slate-800">←</button>
      <span className="text-sm text-slate-400">Pág. {current + 1} / {total}</span>
      <button disabled={current >= total - 1} onClick={() => onChange(current + 1)}
        className="rounded px-3 py-1 text-sm border border-slate-700 disabled:opacity-40 hover:bg-slate-800">→</button>
    </div>
  )
}