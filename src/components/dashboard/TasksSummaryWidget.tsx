import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useTasks } from '../../lib/useTasks'
import { dueLabel } from '../../lib/tasks'

export function TasksSummaryWidget() {
  const { tasks, toggleDone } = useTasks()
  const open = tasks
    .filter((t) => !t.done)
    .sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
    })
    .slice(0, 5)

  return (
    <GlassCard
      title="Aufgaben"
      action={
        <Link to="/aufgaben" className="text-xs font-medium" style={{ color: 'var(--accent-2)' }}>
          Alle →
        </Link>
      }
    >
      {open.length === 0 ? (
        <p className="text-sm text-muted">Alles erledigt.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {open.map((t) => {
            const due = t.dueDate ? dueLabel(t.dueDate) : null
            return (
              <li key={t.id} className="flex items-center gap-2.5">
                <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id)} className="h-3.5 w-3.5 shrink-0 accent-[var(--accent)]" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{t.title}</span>
                {t.starred && <Star size={12} fill="var(--warn)" color="var(--warn)" className="shrink-0" />}
                {due && (
                  <span className="shrink-0 text-xs" style={{ color: due.overdue ? 'var(--danger)' : 'var(--muted)' }}>
                    {due.text}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </GlassCard>
  )
}
