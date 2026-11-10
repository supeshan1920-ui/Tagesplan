import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { TYPE_LABEL, type CalendarEntry, type EntryType } from '../../lib/calendar'

const TYPES: EntryType[] = ['school', 'work', 'off']

function formatDayLabel(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function DayPanel({
  dateKey,
  entries,
  onAdd,
  onRemove,
}: {
  dateKey: string
  entries: CalendarEntry[]
  onAdd: (e: Omit<CalendarEntry, 'id' | 'date'>) => void
  onRemove: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [from, setFrom] = useState('08:00')
  const [to, setTo] = useState('12:00')
  const [type, setType] = useState<EntryType>('school')

  const dayEntries = entries.filter((e) => e.date === dateKey).sort((a, b) => a.from.localeCompare(b.from))

  const add = () => {
    if (to <= from) return
    onAdd({ title: title.trim(), from, to, type })
    setTitle('')
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-ink">{formatDayLabel(dateKey)}</h3>

      {dayEntries.length === 0 ? (
        <p className="text-sm text-muted">Keine Einträge.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {dayEntries.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-strong px-3 py-2"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: `var(--${e.type === 'teams' ? 'accent-2' : e.type})` }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{e.title || TYPE_LABEL[e.type]}</span>
              <span className="shrink-0 text-xs text-muted">{e.from}–{e.to}</span>
              <button type="button" aria-label="Löschen" onClick={() => onRemove(e.id)} className="shrink-0 text-muted hover:text-[var(--danger)]">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-dashed border-border p-3">
        <div className="flex gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="flex-1 rounded-md border px-2 py-1.5 text-xs font-medium"
              style={{
                borderColor: type === t ? `var(--${t})` : 'var(--border)',
                color: type === t ? `var(--${t})` : 'var(--muted)',
                borderWidth: type === t ? 2 : 1,
              }}
            >
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <input
          placeholder="Titel (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2 w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            type="time"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink"
          />
          <span className="text-muted">–</span>
          <input
            type="time"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink"
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="mt-2 w-full rounded-md py-2 text-sm font-semibold text-accent-ink"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          Eintragen
        </button>
      </div>
    </div>
  )
}
