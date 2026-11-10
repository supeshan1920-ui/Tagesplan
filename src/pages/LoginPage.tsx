import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { cloudEnabled, signInWithPassword, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handle(action: 'in' | 'up') {
    setBusy(true)
    setError(null)
    const { error } = action === 'in' ? await signInWithPassword(email, password) : await signUp(email, password)
    setBusy(false)
    if (error) setError(error)
    else navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-ink">Anmelden</h1>
        <p className="mb-5 text-sm text-muted">Deine Daten, synchronisiert auf allen Geräten.</p>

        {!cloudEnabled && (
          <p className="mb-4 rounded-lg border border-border bg-surface-strong p-3 text-xs text-muted">
            Cloud-Sync ist noch nicht eingerichtet — die App läuft bis dahin lokal in diesem Browser.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-Mail"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-surface-strong px-3 py-2.5 text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
          <input
            type="password"
            placeholder="Passwort"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-surface-strong px-3 py-2.5 text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
        </div>

        {error && <p className="mt-3 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handle('in')}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            Anmelden
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handle('up')}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:border-[var(--accent)] disabled:opacity-60"
          >
            Registrieren
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-xs text-muted hover:text-ink"
        >
          Ohne Konto fortfahren →
        </button>
      </GlassCard>
    </div>
  )
}
