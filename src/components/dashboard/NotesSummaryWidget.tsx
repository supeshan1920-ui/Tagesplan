import { Link } from 'react-router-dom'
import { GlassCard } from '../ui/GlassCard'
import { useNotes } from '../../lib/useNotes'

export function NotesSummaryWidget() {
  const { notes } = useNotes()
  const latest = notes.slice(0, 4)

  return (
    <GlassCard
      title="Notizen"
      action={
        <Link to="/notizen" className="text-xs font-medium" style={{ color: 'var(--accent-2)' }}>
          Alle →
        </Link>
      }
    >
      {latest.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Notizen.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {latest.map((n) => (
            <li key={n.id} className="flex items-start gap-2 text-sm text-ink">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--accent-2)' }} />
              <span className="line-clamp-2">{n.text}</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
