import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { getSignalById, updateSignalStatus } from '../services/signals.service'
import { getApiErrorMessage } from '../services/http'
import type { Signal, SignalStatus } from '../types/api'
import { ErrorState, Spinner } from '../components/ui'
import type { FeedOutletContext } from './SignalFeedPage'

const ALLOWED_STATUS: SignalStatus[] = ['PROCESANDO', 'ATENDIDA']

export function SignalDetailModal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { onSignalUpdated } = useOutletContext<FeedOutletContext>()

  const [signal, setSignal] = useState<Signal | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading')
  const [loadError, setLoadError] = useState('')
  const [patching, setPatching] = useState(false)
  const [patchError, setPatchError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [lastStatus, setLastStatus] = useState<SignalStatus | null>(null)

  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Cerrar conservando los filtros del feed en la URL.
  const close = useCallback(() => {
    navigate({ pathname: '/signals', search: searchParams.toString() })
  }, [navigate, searchParams])

  // Cerrar con Escape y enfocar el modal al abrir (accesibilidad).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const load = useCallback(() => {
    if (!id) return
    setLoadState('loading')
    getSignalById(id)
      .then((s) => {
        setSignal(s)
        setLoadState('ready')
      })
      .catch((err) => {
        setLoadError(getApiErrorMessage(err, 'Error al cargar señal'))
        setLoadState('error')
      })
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleStatus(status: SignalStatus) {
    if (!id || !signal) return
    setLastStatus(status)
    setPatching(true)
    setPatchError('')
    setConfirmed(false)
    try {
      const updated = await updateSignalStatus(id, status)
      setSignal(updated)
      setConfirmed(true)
      onSignalUpdated(updated) // refleja el cambio en el feed sin recargar
    } catch (err) {
      // Conserva el estado anterior (signal no se modifica) y muestra error accionable.
      setPatchError(getApiErrorMessage(err, 'Error al actualizar estado'))
    } finally {
      setPatching(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de señal"
        className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Detalle de Señal</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            ✕
          </button>
        </div>

        {loadState === 'loading' && (
          <div className="flex justify-center py-16">
            <Spinner label="Cargando señal" />
          </div>
        )}
        {loadState === 'error' && <ErrorState message={loadError} onRetry={load} />}
        {loadState === 'ready' && signal && (
          <div className="space-y-6">
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{signal.signalType.replace('_', ' ')}</span>
                <span className="rounded-full border border-slate-700 px-3 py-0.5 text-sm">
                  {signal.status}
                </span>
              </div>
              <p className="text-sm text-slate-300">{signal.rawContent}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>
                  Severidad: <strong className="text-slate-200">{signal.severity}</strong>
                </span>
                <span>
                  Tropel: <strong className="text-slate-200">{signal.tropelId}</strong>
                </span>
                <span>Creada: {new Date(signal.createdAt).toLocaleString()}</span>
                <span>Actualizada: {new Date(signal.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-400">Cambiar estado:</p>
              <div className="flex gap-3">
                {ALLOWED_STATUS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={patching || signal.status === st}
                    onClick={() => void handleStatus(st)}
                    className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {patching ? '…' : st}
                  </button>
                ))}
              </div>
              {confirmed && <p className="text-sm text-emerald-400">✓ Estado actualizado correctamente</p>}
              {patchError && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                  {patchError}
                  {lastStatus && (
                    <button
                      type="button"
                      onClick={() => void handleStatus(lastStatus)}
                      className="ml-3 underline text-red-300 hover:text-red-100"
                    >
                      Reintentar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
