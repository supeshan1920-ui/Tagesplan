import { GlassCard } from '../ui/GlassCard'
import { calcZeitrechner } from '../../lib/zeitrechner'
import { useZeitrechnerState, toCalcInput } from '../../lib/useZeitrechnerState'
import { usePausenzeiten } from '../../lib/useSchedules'
import { computeCountdown, formatHMS, secondsUntil } from '../../lib/pausenzeiten'

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-strong p-3 text-center">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg font-bold text-ink">{value}</div>
    </div>
  )
}

export function CountdownWidget({ now }: { now: Date }) {
  const { state } = useZeitrechnerState()
  const { list: pausenzeiten } = usePausenzeiten()
  const result = calcZeitrechner(toCalcInput(state))

  const ohneSaldo = secondsUntil(result.ohneSaldoMin, now)
  const mitSaldo = secondsUntil(result.feierabendMin, now)
  // Falls through to "to-feierabend" (mit Saldo) once today's breaks are all done.
  const pauseCountdown = computeCountdown(pausenzeiten, now, result.feierabendMin)

  const pauseLabel =
    pauseCountdown.kind === 'before-pause'
      ? `Nächste Pause: ${pauseCountdown.pause.name}`
      : pauseCountdown.kind === 'in-pause'
        ? `Pause: ${pauseCountdown.pause.name}`
        : 'Feierabend (mit Saldo)'
  const pauseValue =
    pauseCountdown.kind === 'to-feierabend' && pauseCountdown.done
      ? 'Feierabend ✓'
      : formatHMS(pauseCountdown.secondsLeft)

  return (
    <GlassCard title="Countdowns">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tile label="Ohne Saldo" value={ohneSaldo.done ? 'Feierabend ✓' : formatHMS(ohneSaldo.secondsLeft)} />
        <Tile label="Mit Saldo" value={mitSaldo.done ? 'Feierabend ✓' : formatHMS(mitSaldo.secondsLeft)} />
        <Tile label={pauseLabel} value={pauseValue} />
      </div>
    </GlassCard>
  )
}
