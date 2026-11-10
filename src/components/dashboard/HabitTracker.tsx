import { Fragment, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Flame } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useHabits } from '../../lib/useHabits'
import { DOW, computeStreak, weekDates, ymd } from '../../lib/habits'

export function HabitTracker() {
  const { habits, completions, toggle } = useHabits()
  const [weekOffset, setWeekOffset] = useState(0)

  const base = new Date()
  base.setDate(base.getDate() + weekOffset * 7)
  const days = weekDates(base)
  const todayKey = ymd(new Date())

  return (
    <GlassCard
      title="Gewohnheiten"
      action={
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Vorherige Woche"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-ink"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-muted">
            {weekOffset === 0 ? 'Diese Woche' : weekOffset === -1 ? 'Letzte Woche' : weekOffset === 1 ? 'Nächste Woche' : `${weekOffset > 0 ? '+' : ''}${weekOffset} Wochen`}
          </span>
          <button
            type="button"
            aria-label="Nächste Woche"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-ink"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-[1fr_repeat(7,28px)] items-center gap-x-1 gap-y-3">
        <span />
        {DOW.map((d) => (
          <span key={d} className="text-center text-[9px] font-semibold uppercase tracking-wide text-muted">
            {d}
          </span>
        ))}

        {habits.map((h) => {
          const streak = computeStreak(completions[h.id] ?? {})
          return (
            <Fragment key={h.id}>
              <div className="flex items-center gap-1.5 pr-2 text-sm text-ink">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: h.color }} />
                <span className="truncate">{h.name}</span>
                {streak > 0 && (
                  <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted">
                    <Flame size={10} style={{ color: 'var(--warn)' }} /> {streak}
                  </span>
                )}
              </div>
              {days.map((d) => {
                const key = ymd(d)
                const done = completions[h.id]?.[key]
                const isToday = key === todayKey
                return (
                  <button
                    key={`${h.id}-${key}`}
                    type="button"
                    aria-label={`${h.name} ${key}`}
                    onClick={() => toggle(h.id, key)}
                    className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border transition-colors"
                    style={{
                      borderColor: isToday ? h.color : 'var(--border)',
                      background: done ? h.color : 'transparent',
                    }}
                  >
                    {done && <Check size={12} color="#fff" strokeWidth={3} />}
                  </button>
                )
              })}
            </Fragment>
          )
        })}
      </div>
    </GlassCard>
  )
}
