import { useRef, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { ScheduleEditor } from '../components/settings/ScheduleEditor'
import { ColorWheel } from '../components/settings/ColorWheel'
import { LocationSearch } from '../components/settings/LocationSearch'
import { useProfile } from '../lib/useProfile'
import { useTheme, type ThemeColors } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useZeitrechnerState } from '../lib/useZeitrechnerState'
import { usePausenzeiten, useBlockzeiten } from '../lib/useSchedules'
import { useWeatherLocation } from '../lib/useWeather'
import { useFocusDuration } from '../lib/useFocusTimer'
import { hexToRgb, rgbToHex } from '../lib/color'
import { downloadExport, importAllData, hasOldArbeitszeitData, importOldArbeitszeitData } from '../lib/dataPortability'

const TARGETS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'accent', label: 'Akzent' },
  { key: 'accent2', label: 'Akzent 2' },
  { key: 'bg', label: 'Hintergrund' },
]

const PRESETS: { name: string; colors: ThemeColors }[] = [
  { name: 'Violett', colors: { accent: '#8b5cf6', accent2: '#c084fc', bg: '#0a0b16' } },
  { name: 'Sonnenuntergang', colors: { accent: '#f97316', accent2: '#fb7185', bg: '#190b10' } },
  { name: 'Ozean', colors: { accent: '#06b6d4', accent2: '#3b82f6', bg: '#061018' } },
  { name: 'Wald', colors: { accent: '#22c55e', accent2: '#84cc16', bg: '#06140b' } },
  { name: 'Rose', colors: { accent: '#ec4899', accent2: '#f472b6', bg: '#1a0a12' } },
]

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
  const { location, setLocation } = useWeatherLocation()
  const { durationMin, setDurationMin } = useFocusDuration()
  const [dataMsg, setDataMsg] = useState<string | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)
  const [target, setTarget] = useState<keyof ThemeColors>('accent')
  const targetHex = colors[target]
  const targetRgb = hexToRgb(targetHex) ?? { r: 0, g: 0, b: 0 }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-semibold text-ink">Einstellungen</h1>

      <GlassCard title="Profil">
        <Row label="Name">
          <input className={inputCls} value={profile.name} onChange={(e) => setName(e.target.value)} />
        </Row>
        <Row label="Standort (Wetter)">
          <div className="w-44">
            <LocationSearch current={location} onSelect={setLocation} />
          </div>
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
        <Row label="Fokus-Timer Dauer">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={180}
              className={`${inputCls} w-16 text-center`}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value) || 25)}
            />
            <span className="text-xs text-muted">Min</span>
          </div>
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
        <div className="mb-4 flex gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTarget(t.key)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-medium transition-colors"
              style={{
                borderColor: target === t.key ? 'var(--accent)' : 'var(--border)',
                background: target === t.key ? 'var(--surface-strong)' : 'transparent',
                color: target === t.key ? 'var(--ink)' : 'var(--muted)',
              }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: colors[t.key] }} />
              {t.label}
            </button>
          ))}
        </div>

        <ColorWheel hex={targetHex} onChange={(hex) => setColor(target, hex)} />

        <div className="mt-4 flex items-center gap-2">
          <input
            className={`${inputCls} w-28 font-mono text-sm`}
            value={targetHex}
            onChange={(e) => setColor(target, e.target.value)}
          />
          {(['r', 'g', 'b'] as const).map((channel) => (
            <input
              key={channel}
              type="number"
              min={0}
              max={255}
              className={`${inputCls} w-16 text-center text-sm`}
              value={targetRgb[channel]}
              onChange={(e) =>
                setColor(target, rgbToHex({ ...targetRgb, [channel]: Number(e.target.value) || 0 }))
              }
              aria-label={channel.toUpperCase()}
            />
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-muted">Presets</div>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.name}
                aria-label={p.name}
                onClick={() => {
                  setColor('accent', p.colors.accent)
                  setColor('accent2', p.colors.accent2)
                  setColor('bg', p.colors.bg)
                }}
                className="h-9 w-9 shrink-0 rounded-full border border-border"
                style={{ background: `linear-gradient(135deg, ${p.colors.accent}, ${p.colors.accent2})` }}
              />
            ))}
          </div>
        </div>

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

      <GlassCard title="Daten">
        {hasOldArbeitszeitData() && (
          <button
            type="button"
            onClick={() => {
              const result = importOldArbeitszeitData()
              setDataMsg(
                result
                  ? `Übernommen: Rechner-Einstellungen, ${result.blocks} Blockzeiten, ${result.events} Kalendereinträge. Seite neu laden, um sie zu sehen.`
                  : 'Keine alten Daten gefunden.',
              )
            }}
            className="mb-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:border-[var(--accent)]"
          >
            Alte Arbeitszeit-Daten übernehmen
          </button>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              downloadExport()
              setDataMsg('Export heruntergeladen.')
            }}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            Exportieren
          </button>
          <button
            type="button"
            onClick={() => importFileRef.current?.click()}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:border-[var(--accent)]"
          >
            Importieren
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const count = importAllData(await file.text())
                setDataMsg(`${count} Einträge importiert. Seite neu laden, um sie zu sehen.`)
              } catch {
                setDataMsg('Datei konnte nicht gelesen werden — ist es ein gültiger Export?')
              }
            }}
          />
        </div>
        {dataMsg && <p className="mt-3 text-sm text-muted">{dataMsg}</p>}
      </GlassCard>
    </div>
  )
}
