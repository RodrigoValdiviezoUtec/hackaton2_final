import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../services/http'
import { Spinner } from '../components/ui'

interface LocationState {
  from?: { pathname?: string }
}

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [teamCode, setTeamCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si ya hay sesion, no mostramos el login: vamos al destino original o al dashboard.
  if (status === 'authenticated') {
    const target = (location.state as LocationState | null)?.from?.pathname ?? '/dashboard'
    return <Navigate to={target} replace />
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ teamCode: teamCode.trim(), email: email.trim(), password })
      const target =
        (location.state as LocationState | null)?.from?.pathname ?? '/dashboard'
      navigate(target, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo iniciar sesion. Revisa tus credenciales.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-100">TropelCare Control Room</h1>
          <p className="mt-1 text-sm text-slate-400">Inicia sesion con las credenciales del equipo</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <Field
            id="teamCode"
            label="Team code"
            value={teamCode}
            onChange={setTeamCode}
            placeholder="TEAM-001"
            autoComplete="organization"
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="operator@tuckersoft.com"
            autoComplete="email"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            {submitting ? <Spinner label="Ingresando" /> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
}

function Field({ id, label, value, onChange, type = 'text', placeholder, autoComplete }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  )
}
