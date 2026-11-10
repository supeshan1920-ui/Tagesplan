import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useCalendarEntries } from '../../lib/useCalendarEntries'
import { TYPE_LABEL, ymd } from '../../lib/calendar'

export function HeuteWidget({ now }: { now: Date }) {
  const { entries } = useCalendarEntries()
  const todayKey = ymd(now)
  const today = entries.filter((e) => e.date === todayKey).sort((a, b) => a.from.localeCompare(b.from))
  const nowMin = now.getHours() * 60 + now.getMinutes()

  return (
    <GlassCard
      title="Heute"
      action={
        <Link to="/kalender" className="text-xs font-medium" style={{ color: 'var(--accent-2)' }}>
          Kalender →
        </Link>
      }
    >
      {today.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <CalendarClock size={16} /> Keine Termine heute.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {today.map((e) => {
            const [fh, fm] = e.from.split(':').map(Number)
            const [th, tm] = e.to.split(':').map(Number)
            const fromMin = fh * 60 + fm
            const toMinV = th * 60 + tm
            const isPast = nowMin >= toMinV
            const isCurrent = nowMin >= fromMin && nowMin < toMinV
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
                style={{
                  borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
                  background: isCurrent ? 'var(--surface-strong)' : 'transparent',
                  opacity: isPast ? 0.45 : 1,
                }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: `var(--${e.type === 'teams' ? 'accent-2' : e.type})` }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{e.title || TYPE_LABEL[e.type]}</span>
                <span className="shrink-0 text-xs text-muted">{e.from}–{e.to}</span>
              </li>
            )
          })}
        </ul>
      )}
    </GlassCard>
  )
}
