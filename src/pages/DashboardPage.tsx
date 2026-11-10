import { Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'
import { WeatherWidget } from '../components/dashboard/WeatherWidget'
import { HeuteWidget } from '../components/dashboard/HeuteWidget'
import { TasksSummaryWidget } from '../components/dashboard/TasksSummaryWidget'
import { NotesSummaryWidget } from '../components/dashboard/NotesSummaryWidget'
import { HabitTracker } from '../components/dashboard/HabitTracker'
import { FocusTimerWidget } from '../components/dashboard/FocusTimerWidget'
import { PlaylistWidget } from '../components/dashboard/PlaylistWidget'
import { useClock, greetingFor, formatGermanDate } from '../lib/useClock'
import { useProfile } from '../lib/useProfile'
import { useZeitrechnerState, toCalcInput } from '../lib/useZeitrechnerState'
import { calcZeitrechner, formatTime } from '../lib/zeitrechner'

export function DashboardPage() {
  const now = useClock()
  const { profile } = useProfile()
  const { state } = useZeitrechnerState()
  const result = calcZeitrechner(toCalcInput(state))

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const remainingMin = Math.max(0, result.feierabendMin - nowMin)
  const done = remainingMin <= 0

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold leading-tight text-ink">
            {greetingFor(now)}, <span style={{ color: 'var(--accent-2)' }}>{profile.name}</span>{' '}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-2 text-sm text-muted">{formatGermanDate(now)}</p>
          <p
            className="mt-3 font-mono text-[clamp(40px,6vw,64px)] font-bold tracking-tight text-ink"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
        </div>

        <GlassCard>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Clock3 size={14} /> Arbeitszeit
          </div>
          <p className="mt-3 text-3xl font-bold text-ink">
            {done ? 'Feierabend ✓' : `${String(Math.floor(remainingMin / 60)).padStart(2, '0')}h ${String(remainingMin % 60).padStart(2, '0')}m`}
          </p>
          <p className="mt-1 text-sm text-muted">
            {done ? `seit ${formatTime(result.feierabendMin)}` : `Feierabend um ${formatTime(result.feierabendMin)}`}
          </p>
          <Link
            to="/zeitrechner"
            className="mt-4 inline-block text-sm font-medium"
            style={{ color: 'var(--accent-2)' }}
          >
            Zum Zeitrechner →
          </Link>
        </GlassCard>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <HeuteWidget now={now} />
        <WeatherWidget />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TasksSummaryWidget />
        <NotesSummaryWidget />
      </section>

      <section>
        <HabitTracker />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FocusTimerWidget />
        <PlaylistWidget />
      </section>
    </div>
  )
}
