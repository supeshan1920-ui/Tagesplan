import { GlassCard } from '../components/ui/GlassCard'
import { ScheduleEditor } from '../components/settings/ScheduleEditor'
import { useProfile } from '../lib/useProfile'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useZeitrechnerState } from '../lib/useZeitrechnerState'
import { usePausenzeiten, useBlockzeiten } from '../lib/useSchedules'

const inputCls =
  'rounded-lg border border-border bg-surface-strong px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 last:mb-0">
      <label className="text-sm text-ink">{label}</label>
      {children}
    </div>
  )
}

export function EinstellungenPage() {
  const { profile, setName } = useProfile()
  const { mode, setMode, colors, setColor, glassOpacity, setGlassOpacity, reset } = useTheme()
  const { cloudEnabled, session } = useAuth()
  const { state, update } = useZeitrechnerState()
  const pausenzeiten = usePausenzeiten()
  const blockzeiten = useBlockzeiten()

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-semibold text-ink">Einstellungen</h1>

      <GlassCard title="Profil">
        <Row label="Name">
          <input className={inputCls} value={profile.name} onChange={(e) => setName(e.target.value)} />
        </Row>
      </GlassCard>

      <GlassCard title="Konto · Geräte-Sync">
        {cloudEnabled ? (
          <p className="text-sm text-muted">
            {session ? `Angemeldet als ${session.user.email}` : 'Cloud-Sync ist eingerichtet — Anmeldung folgt.'}
          </p>
        ) : (
          <p className="text-sm text-muted">
            Cloud-Sync ist noch nicht eingerichtet. Deine Daten bleiben lokal in diesem Browser, bis ein
            Supabase-Projekt verbunden ist.
          </p>
        )}
      </GlassCard>

      <GlassCard title="Sollarbeitszeit & Feierabend">
        <Row label="Sollarbeitszeit">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={24}
              className={`${inputCls} w-16 text-center`}
              value={state.sollH}
              onChange={(e) => update('sollH', Number(e.target.value) || 0)}
            />
            <span className="text-xs text-muted">Std</span>
            <input
              type="number"
              min={0}
              max={59}
              className={`${inputCls} w-16 text-center`}
              value={state.sollM}
              onChange={(e) => update('sollM', Number(e.target.value) || 0)}
            />
            <span className="text-xs text-muted">Min</span>
          </div>
        </Row>
        <Row label="Frühester Feierabend">
          <input type="time" className={`${inputCls} w-[110px] text-center`} value={state.floor} onChange={(e) => update('floor', e.target.value)} />
        </Row>
      </GlassCard>

      <GlassCard title="Pausenzeiten">
        <ScheduleEditor
          items={pausenzeiten.list}
          withWeekdays
          onAdd={pausenzeiten.add}
          onUpdate={pausenzeiten.update}
          onRemove={pausenzeiten.remove}
        />
      </GlassCard>

      <GlassCard title="Blockzeiten">
        <p className="mb-3 text-xs text-muted">Nur zur Übersicht — beeinflussen keine Berechnung.</p>
        <ScheduleEditor
          items={blockzeiten.list}
          onAdd={blockzeiten.add}
          onUpdate={blockzeiten.update}
          onRemove={blockzeiten.remove}
        />
      </GlassCard>

      <GlassCard title="Darstellung">
        <div className="flex gap-2">
          {(['dark', 'light'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              style={{
                borderColor: mode === m ? 'var(--accent)' : 'var(--border)',
                color: mode === m ? 'var(--ink)' : 'var(--muted)',
                background: mode === m ? 'var(--surface-strong)' : 'transparent',
              }}
            >
              {m === 'dark' ? 'Dunkel' : 'Hell'}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Farben">
        <p className="mb-3 text-xs text-muted">
          Hex-Eingabe für jetzt — ein voller Farbkreis mit Live-Vorschau folgt in der nächsten Phase.
        </p>
        {(
          [
            ['accent', 'Akzent'],
            ['accent2', 'Akzent 2'],
            ['bg', 'Hintergrund'],
          ] as const
        ).map(([key, label]) => (
          <Row key={key} label={label}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => setColor(key, e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
              />
              <input
                className={`${inputCls} w-24 font-mono text-sm`}
                value={colors[key]}
                onChange={(e) => setColor(key, e.target.value)}
              />
            </div>
          </Row>
        ))}
        <Row label="Glas-Transparenz">
          <input
            type="range"
            min={0.02}
            max={0.18}
            step={0.005}
            value={glassOpacity}
            onChange={(e) => setGlassOpacity(Number(e.target.value))}
            className="w-32 accent-[var(--accent)]"
          />
        </Row>
        <button
          type="button"
          onClick={reset}
          className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:border-[var(--accent)]"
        >
          Farben zurücksetzen
        </button>
      </GlassCard>
    </div>
  )
}
