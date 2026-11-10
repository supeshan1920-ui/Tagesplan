import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

interface BaseItem {
  id: string
  name: string
  from: string
  to: string
  weekdays?: number[]
}

interface ScheduleEditorProps<T extends BaseItem> {
  items: T[]
  withWeekdays?: boolean
  onAdd: (item: { name: string; from: string; to: string; weekdays: number[] }) => void
  onUpdate: (id: string, patch: Partial<T>) => void
  onRemove: (id: string) => void
}

export function ScheduleEditor<T extends BaseItem>({
  items,
  withWeekdays = false,
  onAdd,
  onUpdate,
  onRemove,
}: ScheduleEditorProps<T>) {
  const [name, setName] = useState('')
  const [from, setFrom] = useState('08:00')
  const [to, setTo] = useState('09:00')
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5])

  const toggleNewWeekday = (d: number) =>
    setWeekdays((ws) => (ws.includes(d) ? ws.filter((x) => x !== d) : [...ws, d].sort()))

  const add = () => {
    if (!name.trim() || to <= from) return
    onAdd({ name: name.trim(), from, to, weekdays })
    setName('')
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-surface-strong p-3">
          <div className="flex items-center gap-2">
            <input
              className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              value={item.name}
              onChange={(e) => onUpdate(item.id, { name: e.target.value } as Partial<T>)}
            />
            <input
              type="time"
              className="rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink"
              value={item.from}
              onChange={(e) => onUpdate(item.id, { from: e.target.value } as Partial<T>)}
            />
            <span className="text-muted">–</span>
            <input
              type="time"
              className="rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink"
              value={item.to}
              onChange={(e) => onUpdate(item.id, { to: e.target.value } as Partial<T>)}
            />
            <button
              type="button"
              aria-label="Löschen"
              onClick={() => onRemove(item.id)}
              className="shrink-0 text-muted hover:text-[var(--danger)]"
            >
              <Trash2 size={16} />
            </button>
          </div>
          {withWeekdays && (
            <div className="mt-2 flex gap-1">
              {WEEKDAY_LABELS.map((label, i) => {
                const d = i + 1
                const active = item.weekdays?.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      onUpdate(item.id, {
                        weekdays: active
                          ? item.weekdays!.filter((x) => x !== d)
                          : [...(item.weekdays ?? []), d].sort(),
                      } as Partial<T>)
                    }
                    className="h-7 w-7 rounded-md text-xs font-medium transition-colors"
                    style={{
                      background: active ? 'var(--accent)' : 'transparent',
                      color: active ? 'var(--accent-ink)' : 'var(--muted)',
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}

      <div className="mt-1 rounded-lg border border-dashed border-border p-3">
        <div className="flex items-center gap-2">
          <input
            placeholder="Name"
            className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="time"
            className="rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="text-muted">–</span>
          <input
            type="time"
            className="rounded-md border border-border bg-transparent px-2 py-1.5 text-sm text-ink"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button
            type="button"
            aria-label="Hinzufügen"
            onClick={add}
            className="shrink-0 rounded-md p-1.5 text-accent-ink"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={16} />
          </button>
        </div>
        {withWeekdays && (
          <div className="mt-2 flex gap-1">
            {WEEKDAY_LABELS.map((label, i) => {
              const d = i + 1
              const active = weekdays.includes(d)
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleNewWeekday(d)}
                  className="h-7 w-7 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? 'var(--accent-ink)' : 'var(--muted)',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
