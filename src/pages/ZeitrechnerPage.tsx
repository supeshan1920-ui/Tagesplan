import { useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { ProgressRing } from '../components/ui/ProgressRing'
import { TodayTimeline } from '../components/zeitrechner/TodayTimeline'
import { useZeitrechnerState, toCalcInput } from '../lib/useZeitrechnerState'
import { calcZeitrechner, formatSigned, formatTime, signClass } from '../lib/zeitrechner'
import { usePausenzeiten, useBlockzeiten } from '../lib/useSchedules'
import { computeCountdown, formatHMS } from '../lib/pausenzeiten'
import { useClock } from '../lib/useClock'

const inputCls =
  'w-[110px] rounded-lg border border-border bg-surface-strong px-3 py-2 text-center font-mono text-[15px] text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <label className="text-sm text-ink">{label}</label>
      {children}
    </div>
  )
}

const signColor = (cls: 'plus' | 'minus' | 'neutral') =>
  cls === 'plus' ? 'var(--good)' : cls === 'minus' ? 'var(--danger)' : 'var(--ink)'

export function ZeitrechnerPage() {
  const { state, update, reset } = useZeitrechnerState()
  const result = calcZeitrechner(toCalcInput(state))
  const [savedNote, setSavedNote] = useState('')
  const now = useClock()
  const { list: pausenzeiten } = usePausenzeiten()
  const { list: blockzeiten } = useBlockzeiten()

  const countdown = computeCountdown(pausenzeiten, now, result.feierabendMin)
  const countdownLabel =
    countdown.kind === 'before-pause'
      ? `Nächste Pause: ${countdown.pause.name} in ${formatHMS(countdown.secondsLeft)}`
      : countdown.kind === 'in-pause'
        ? `Pause läuft – noch ${formatHMS(countdown.secondsLeft)}`
        : countdown.done
          ? 'Feierabend ✓'
          : `Feierabend in ${formatHMS(countdown.secondsLeft)}`

  const startMin = (() => {
    const [h, m] = state.start.split(':').map(Number)
    return h * 60 + m
  })()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const dayProgress =
    result.feierabendMin > startMin ? (nowMin - startMin) / (result.feierabendMin - startMin) : 0

  const saveDay = () => {
    if (result.saldoHeuteMin == null) return
    const key = 'tagesplan.saldoLog.v1'
    const today = new Date().toISOString().slice(0, 10)
    try {
      const log = JSON.parse(localStorage.getItem(key) ?? '{}')
      log[today] = { saldoHeute: result.saldoHeuteMin, start: state.start, gehzeit: state.gehzeit }
      localStorage.setItem(key, JSON.stringify(log))
      setSavedNote(`Gespeichert für ${today}.`)
      setTimeout(() => setSavedNote(''), 3000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-semibold text-ink">Zeitrechner</h1>

      <GlassCard>
        <div className="flex items-center gap-5">
          <ProgressRing
            progress={dayProgress}
            label={`${Math.round(Math.min(1, Math.max(0, dayProgress)) * 100)}%`}
            sublabel="Arbeitstag"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              {countdown.kind === 'in-pause' ? 'Pause' : countdown.kind === 'before-pause' ? 'Nächste Pause' : 'Feierabend'}
            </div>
            <p className="mt-1 break-words text-xl font-bold text-ink">{countdownLabel}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Heute">
        <Row label="Startzeit">
          <input type="time" className={inputCls} value={state.start} onChange={(e) => update('start', e.target.value)} />
        </Row>
        <Row label="Pause (Min)">
          <input
            type="number"
            min={0}
            max={240}
            step={5}
            className={inputCls}
            value={state.pause}
            onChange={(e) => update('pause', Number(e.target.value) || 0)}
          />
        </Row>
        <Row label="Pause ab (optional)">
          <input type="time" className={inputCls} value={state.pauseAb} onChange={(e) => update('pauseAb', e.target.value)} />
        </Row>
        {result.pauseZurueckMin != null && (
          <p className="mt-2 text-right text-xs text-muted">
            Pause zurück um <span className="text-ink">{formatTime(result.pauseZurueckMin)}</span>
          </p>
        )}
        <div className="my-4 h-px bg-border" />
        <Row label="Saldo Übertrag (Min)">
          <input
            type="number"
            step={1}
            className={inputCls}
            value={state.uebertrag}
            onChange={(e) => update('uebertrag', Number(e.target.value) || 0)}
          />
        </Row>
        <p className="mt-2 text-xs text-muted">Negativer Saldo = Minus eintragen (z. B. −11). Positiv = Plus.</p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Feierabend</div>
          <div className="mt-2 text-4xl font-bold text-ink">{formatTime(result.feierabendMin)}</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Ohne Saldo</div>
          <div className="mt-2 text-4xl font-bold text-ink">{formatTime(result.ohneSaldoMin)}</div>
        </GlassCard>
      </div>

      <GlassCard title="Wenn ich gehe um …">
        <Row label="Gehzeit">
          <input type="time" className={inputCls} value={state.gehzeit} onChange={(e) => update('gehzeit', e.target.value)} />
        </Row>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-surface-strong p-3 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted">Heute</div>
            <div className="mt-1 text-xl font-bold" style={{ color: result.saldoHeuteMin != null ? signColor(signClass(result.saldoHeuteMin)) : undefined }}>
              {result.saldoHeuteMin != null ? formatSigned(result.saldoHeuteMin) : '—'}
            </div>
          </div>
          <div className="rounded-xl bg-surface-strong p-3 text-center">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted">Gesamt-Saldo</div>
            <div className="mt-1 text-xl font-bold" style={{ color: result.saldoTotalMin != null ? signColor(signClass(result.saldoTotalMin)) : undefined }}>
              {result.saldoTotalMin != null ? formatSigned(result.saldoTotalMin) : '—'}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={saveDay}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-accent-ink"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            Tag speichern
          </button>
        </div>
        {savedNote && <p className="mt-2 text-xs text-muted">{savedNote}</p>}
      </GlassCard>

      <GlassCard title="Heute im Überblick">
        <TodayTimeline pausenzeiten={pausenzeiten} blockzeiten={blockzeiten} now={now} />
      </GlassCard>

      <details className="glass p-5">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">
          Einstellungen
        </summary>
        <div className="mt-4">
          <Row label="Sollarbeitszeit">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={24}
                className="w-16 rounded-lg border border-border bg-surface-strong px-2 py-2 text-center font-mono text-ink"
                value={state.sollH}
                onChange={(e) => update('sollH', Number(e.target.value) || 0)}
              />
              <span className="text-xs text-muted">Std</span>
              <input
                type="number"
                min={0}
                max={59}
                className="w-16 rounded-lg border border-border bg-surface-strong px-2 py-2 text-center font-mono text-ink"
                value={state.sollM}
                onChange={(e) => update('sollM', Number(e.target.value) || 0)}
              />
              <span className="text-xs text-muted">Min</span>
            </div>
          </Row>
          <Row label="Frühester Feierabend">
            <input type="time" className={inputCls} value={state.floor} onChange={(e) => update('floor', e.target.value)} />
          </Row>
          <p className="mt-2 text-xs text-muted">Standard: 8 Std 12 Min, frühester Feierabend 16:00.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:border-[var(--accent)]"
          >
            Standard
          </button>
        </div>
      </details>
    </div>
  )
}
