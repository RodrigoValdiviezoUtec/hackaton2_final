import type { ReactNode } from 'react'

/** Spinner que respeta prefers-reduced-motion (no gira si el usuario lo pide). */
export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <span
        className="h-5 w-5 rounded-full border-2 border-slate-600 border-t-emerald-400 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="text-sm text-slate-400">{label}…</span>
    </span>
  )
}

/** Estado de error reutilizable con accion de reintento. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200"
    >
      <p className="font-medium">Algo salio mal</p>
      <p className="mt-1 text-sm text-red-300/90">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-100 hover:bg-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

/** Estado vacio reutilizable. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
      <p className="font-medium text-slate-200">{title}</p>
      {children && <p className="mt-1 text-sm text-slate-400">{children}</p>}
    </div>
  )
}
