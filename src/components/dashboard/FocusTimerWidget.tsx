import { Play, Pause, RotateCcw } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { ProgressRing } from '../ui/ProgressRing'
import { useFocusDuration, useFocusTimer } from '../../lib/useFocusTimer'

export function FocusTimerWidget() {
  const { durationMin } = useFocusDuration()
  const { remainingSec, running, progress, start, pause, reset } = useFocusTimer(durationMin)

  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0')
  const ss = String(remainingSec % 60).padStart(2, '0')

  return (
    <GlassCard className="flex flex-col items-center">
      <div className="mb-3 w-full text-xs font-semibold uppercase tracking-wide text-muted">Fokus-Timer</div>
      <ProgressRing progress={progress} label={`${mm}:${ss}`} sublabel={running ? 'Läuft' : remainingSec === 0 ? 'Fertig' : 'Fokus'} />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          aria-label={running ? 'Pausieren' : 'Starten'}
          onClick={running ? pause : start}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          type="button"
          aria-label="Zurücksetzen"
          onClick={reset}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted hover:text-ink"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </GlassCard>
  )
}
