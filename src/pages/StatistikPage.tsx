import { GlassCard } from '../components/ui/GlassCard'
import { SaldoBarChart } from '../components/statistik/SaldoBarChart'
import { useTasks } from '../lib/useTasks'
import { formatSigned, signClass } from '../lib/zeitrechner'

const DAY_MS = 86_400_000

function readSaldoLog(): { date: string; saldoHeute: number }[] {
  try {
    const raw = JSON.parse(localStorage.getItem('tagesplan.saldoLog.v1') ?? '{}')
    const today = new Date()
    const cutoff = today.getTime() - 7 * DAY_MS
    return Object.entries(raw as Record<string, { saldoHeute: number }>)
      .filter(([date]) => new Date(date + 'T00:00:00').getTime() >= cutoff)
      .map(([date, v]) => ({ date, saldoHeute: v.saldoHeute }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch {
    return []
  }
}

const signColor = (cls: 'plus' | 'minus' | 'neutral') =>
  cls === 'plus' ? 'var(--good)' : cls === 'minus' ? 'var(--danger)' : 'var(--ink)'

export function StatistikPage() {
  const { tasks } = useTasks()
  const saldoPoints = readSaldoLog()
  const weekTotal = saldoPoints.reduce((a, p) => a + p.saldoHeute, 0)

  const cutoff = Date.now() - 7 * DAY_MS
  const doneThisWeek = tasks.filter((t) => t.completedAt && t.completedAt >= cutoff).length
  const openCount = tasks.filter((t) => !t.done).length

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-semibold text-ink">Statistik</h1>

      <GlassCard title="Saldo — letzte 7 Tage">
        <SaldoBarChart points={saldoPoints} />
        {saldoPoints.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Summe:{' '}
            <span className="font-semibold" style={{ color: signColor(signClass(weekTotal)) }}>
              {formatSigned(weekTotal)}
            </span>
          </p>
        )}
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Erledigt (7 Tage)</div>
          <div className="mt-2 text-4xl font-bold text-ink">{doneThisWeek}</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Offen</div>
          <div className="mt-2 text-4xl font-bold text-ink">{openCount}</div>
        </GlassCard>
      </div>

      <p className="text-xs text-muted">Fokus-Sessions und Gewohnheiten folgen, sobald diese Funktionen verfügbar sind.</p>
    </div>
  )
}
