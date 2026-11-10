import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DOW, MONTHS, monthMatrix, ymd, type CalendarEntry } from '../../lib/calendar'

export function MonthGrid({
  cursor,
  onCursorChange,
  selected,
  onSelect,
  entries,
}: {
  cursor: Date
  onCursorChange: (d: Date) => void
  selected: string
  onSelect: (dateKey: string) => void
  entries: CalendarEntry[]
}) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const days = monthMatrix(year, month)
  const today = ymd(new Date())

  const entriesByDate = new Map<string, CalendarEntry[]>()
  for (const e of entries) {
    const list = entriesByDate.get(e.date) ?? []
    list.push(e)
    entriesByDate.set(e.date, list)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-base font-semibold text-ink">
          {MONTHS[month]} {year}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Vorheriger Monat"
            onClick={() => onCursorChange(new Date(year, month - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:text-ink"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => onCursorChange(new Date())}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:border-[var(--accent)]"
          >
            Heute
          </button>
          <button
            type="button"
            aria-label="Nächster Monat"
            onClick={() => onCursorChange(new Date(year, month + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:text-ink"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DOW.map((d) => (
          <div key={d} className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const key = ymd(d)
          const inMonth = d.getMonth() === month
          const dayEntries = entriesByDate.get(key) ?? []
          const types = [...new Set(dayEntries.map((e) => e.type))]
          const isSelected = key === selected
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className="flex aspect-square flex-col items-center justify-start gap-1 rounded-lg border p-1.5 text-left transition-colors"
              style={{
                borderColor: isSelected ? 'var(--accent)' : key === today ? 'var(--ink)' : 'var(--border)',
                background: isSelected ? 'var(--surface-strong)' : 'var(--surface)',
                opacity: inMonth ? 1 : 0.35,
              }}
            >
              <span className="text-xs text-muted">{d.getDate()}</span>
              <span className="mt-auto flex flex-wrap gap-0.5">
                {types.map((t) => (
                  <span
                    key={t}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: `var(--${t === 'teams' ? 'accent-2' : t})` }}
                  />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {(['school', 'work', 'off', 'teams'] as const).map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: `var(--${t === 'teams' ? 'accent-2' : t})` }} />
            {t === 'school' ? 'Schule' : t === 'work' ? 'Arbeit' : t === 'off' ? 'Frei' : 'Teams'}
          </span>
        ))}
      </div>
    </div>
  )
}
