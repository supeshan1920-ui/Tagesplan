import { useState } from 'react'
import { Star, Trash2, Plus } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { useTasks } from '../lib/useTasks'
import {
  dueLabel,
  matchesFilter,
  PRIORITY_COLOR_VAR,
  PRIORITY_LABEL,
  type Priority,
  type Task,
  type TaskFilter,
} from '../lib/tasks'

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'heute', label: 'Heute' },
  { key: 'bald', label: 'Bald' },
  { key: 'erledigt', label: 'Erledigt' },
]

function TaskRow({
  task,
  onToggleDone,
  onToggleStar,
  onRemove,
}: {
  task: Task
  onToggleDone: () => void
  onToggleStar: () => void
  onRemove: () => void
}) {
  const due = task.dueDate ? dueLabel(task.dueDate) : null
  const hasMeta = (task.kind === 'abgabe' && task.priority) || (due && !task.done)
  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-strong px-3 py-2.5">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={task.done}
          onChange={onToggleDone}
          className="h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span className={`min-w-0 flex-1 truncate text-sm ${task.done ? 'text-muted line-through' : 'text-ink'}`}>
          {task.title}
        </span>
        <button type="button" aria-label="Markieren" onClick={onToggleStar} className="shrink-0">
          <Star size={15} fill={task.starred ? 'var(--warn)' : 'none'} color={task.starred ? 'var(--warn)' : 'var(--muted)'} />
        </button>
        <button type="button" aria-label="Löschen" onClick={onRemove} className="shrink-0 text-muted hover:text-[var(--danger)]">
          <Trash2 size={15} />
        </button>
      </div>
      {hasMeta && (
        <div className="flex flex-wrap items-center gap-2 pl-7">
          {task.kind === 'abgabe' && task.priority && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: `var(${PRIORITY_COLOR_VAR[task.priority]})`, border: `1px solid var(${PRIORITY_COLOR_VAR[task.priority]})` }}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}
          {due && !task.done && (
            <span className="shrink-0 text-xs" style={{ color: due.overdue ? 'var(--danger)' : 'var(--muted)' }}>
              {due.text}
            </span>
          )}
        </div>
      )}
    </li>
  )
}

export function AufgabenPage() {
  const { tasks, add, update, toggleDone, remove } = useTasks()
  const [filter, setFilter] = useState<TaskFilter>('alle')
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [kind, setKind] = useState<'aufgabe' | 'abgabe'>('aufgabe')
  const [priority, setPriority] = useState<Priority>('mittel')

  const visible = tasks
    .filter((t) => matchesFilter(t, filter))
    .sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
    })

  const submit = () => {
    if (!title.trim()) return
    add({ title: title.trim(), dueDate: dueDate || null, kind, priority: kind === 'abgabe' ? priority : null })
    setTitle('')
    setDueDate('')
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-semibold text-ink">Aufgaben</h1>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            style={{
              borderColor: filter === f.key ? 'var(--accent)' : 'var(--border)',
              background: filter === f.key ? 'var(--surface-strong)' : 'transparent',
              color: filter === f.key ? 'var(--ink)' : 'var(--muted)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <GlassCard>
        {visible.length === 0 ? (
          <p className="text-sm text-muted">Nichts hier.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onToggleDone={() => toggleDone(t.id)}
                onToggleStar={() => update(t.id, { starred: !t.starred })}
                onRemove={() => remove(t.id)}
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard title="Neue Aufgabe">
        <div className="flex gap-1.5">
          {(['aufgabe', 'abgabe'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className="flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium"
              style={{
                borderColor: kind === k ? 'var(--accent)' : 'var(--border)',
                color: kind === k ? 'var(--ink)' : 'var(--muted)',
              }}
            >
              {k === 'aufgabe' ? 'Aufgabe' : 'Abgabe'}
            </button>
          ))}
        </div>

        <input
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-3 w-full rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        />

        <div className="mt-3 flex items-center gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-ink"
          />
          {kind === 'abgabe' && (
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-ink"
            >
              <option value="hoch">Hoch</option>
              <option value="mittel">Mittel</option>
              <option value="tief">Tief</option>
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          <Plus size={16} /> Hinzufügen
        </button>
      </GlassCard>
    </div>
  )
}
