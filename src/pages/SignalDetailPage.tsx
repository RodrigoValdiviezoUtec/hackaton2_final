import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSignalById, updateSignalStatus } from '../services/signals.service'
import { getApiErrorMessage } from '../services/http'
import type { Signal, SignalStatus } from '../types/api'
import { ErrorState, Spinner } from '../components/ui'

const ALLOWED_STATUS: SignalStatus[] = ['PROCESANDO', 'ATENDIDA']

export function SignalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [signal, setSignal] = useState<Signal | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading')
  const [loadError, setLoadError] = useState('')
  const [patching, setPatching] = useState(false)
  const [patchError, setPatchError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const load = useCallback(() => {
    if (!id) return
    setLoadState('loading')
    getSignalById(id)
      .then((s) => { setSignal(s); setLoadState('ready') })
      .catch((err) => { setLoadError(getApiErrorMessage(err, 'Error al cargar señal')); setLoadState('error') })
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleStatus(status: SignalStatus) {
    if (!id || !signal) return
    setPatching(true)
    setPatchError('')
    setConfirmed(false)
    try {
      const updated = await updateSignalStatus(id, status)
      setSignal(updated)
      setConfirmed(true)
    } catch (err) {
      setPatchError(getApiErrorMessage(err, 'Error al actualizar estado'))
    } finally {
      setPatching(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">Detalle de Señal</h1>
          <button type="button" onClick={() => navigate(-1)}
            className="text-sm text-slate-400 hover:text-slate-200">← Volver</button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loadState === 'loading' && <div className="flex justify-center py-16"><Spinner label="Cargando señal" /></div>}
        {loadState === 'error' && <ErrorState message={loadError} onRetry={load} />}
        {loadState === 'ready' && signal && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{signal.signalType.replace('_', ' ')}</span>
                <span className="text-sm rounded-full border border-slate-700 px-3 py-0.5">{signal.status}</span>
              </div>
              <p className="text-sm text-slate-300">{signal.rawContent}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>Severidad: <strong className="text-slate-200">{signal.severity}</strong></span>
                <span>Tropel: <strong className="text-slate-200">{signal.tropelId}</strong></span>
                <span>Creada: {new Date(signal.createdAt).toLocaleString()}</span>
                <span>Actualizada: {new Date(signal.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Cambiar estado:</p>
              <div className="flex gap-3">
                {ALLOWED_STATUS.map((st) => (
                  <button key={st} type="button"
                    disabled={patching || signal.status === st}
                    onClick={() => void handleStatus(st)}
                    className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-emerald-400">
                    {patching ? '…' : st}
                  </button>
                ))}
              </div>
              {confirmed && <p className="text-sm text-emerald-400">✓ Estado actualizado correctamente</p>}
              {patchError && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                  {patchError}
                  <button type="button" onClick={() => setPatchError('')}
                    className="ml-3 underline text-red-300 hover:text-red-100">Cerrar</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}