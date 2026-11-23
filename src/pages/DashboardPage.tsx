import { Link } from 'react-router-dom'
import { WeatherWidget } from '../components/dashboard/WeatherWidget'
import { HeuteWidget } from '../components/dashboard/HeuteWidget'
import { CountdownWidget } from '../components/dashboard/CountdownWidget'
import { TasksSummaryWidget } from '../components/dashboard/TasksSummaryWidget'
import { NotesSummaryWidget } from '../components/dashboard/NotesSummaryWidget'
import { HabitTracker } from '../components/dashboard/HabitTracker'
import { FocusTimerWidget } from '../components/dashboard/FocusTimerWidget'
import { PlaylistWidget } from '../components/dashboard/PlaylistWidget'
import { useClock, greetingFor, formatGermanDate } from '../lib/useClock'
import { useProfile } from '../lib/useProfile'

export function DashboardPage() {
  const now = useClock()
  const { profile } = useProfile()

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

        <div className="flex flex-col gap-3">
          <CountdownWidget now={now} />
          <Link
            to="/zeitrechner"
            className="self-start text-sm font-medium"
            style={{ color: 'var(--accent-2)' }}
          >
            Zum Zeitrechner →
          </Link>
        </div>
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
