import type { Blockzeit, Pausenzeit } from '../../lib/pausenzeiten'
import { pausenForDay } from '../../lib/pausenzeiten'

interface TimelineEntry {
  id: string
  label: string
  from: string
  to: string
  kind: 'pause' | 'block'
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function TodayTimeline({
  pausenzeiten,
  blockzeiten,
  now,
}: {
  pausenzeiten: Pausenzeit[]
  blockzeiten: Blockzeit[]
  now: Date
}) {
  const entries: TimelineEntry[] = [
    ...pausenForDay(pausenzeiten, now).map((p) => ({ id: p.id, label: p.name, from: p.from, to: p.to, kind: 'pause' as const })),
    ...blockzeiten.map((b) => ({ id: b.id, label: b.name, from: b.from, to: b.to, kind: 'block' as const })),
  ].sort((a, b) => toMin(a.from) - toMin(b.from))

  if (entries.length === 0) {
    return <p className="text-sm text-muted">Keine Pausen oder Blockzeiten für heute hinterlegt.</p>
  }

  const nowMin = now.getHours() * 60 + now.getMinutes()

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((e) => {
        const fromMin = toMin(e.from)
        const toMinV = toMin(e.to)
        const isPast = nowMin >= toMinV
        const isCurrent = nowMin >= fromMin && nowMin < toMinV
        return (
          <li
            key={e.id}
            className="flex items-center gap-3 rounded-lg border px-3 py-2 transition-opacity"
            style={{
              borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
              background: isCurrent ? 'var(--surface-strong)' : 'transparent',
              opacity: isPast ? 0.45 : 1,
            }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: e.kind === 'pause' ? 'var(--accent-2)' : 'var(--work)' }}
            />
            <span className="flex-1 text-sm text-ink">{e.label}</span>
            <span className="text-xs text-muted">{e.from}–{e.to}</span>
          </li>
        )
      })}
    </ul>
  )
}
