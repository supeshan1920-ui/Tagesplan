import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { parseIcs, parseJsonImport, type CalendarEntry } from '../../lib/calendar'

const PLACEHOLDER = `[{"date":"2026-11-12","from":"09:00","to":"10:00","title":"Standup","type":"teams"}]`

export function ImportDialog({
  onClose,
  onImport,
}: {
  onClose: () => void
  onImport: (entries: Omit<CalendarEntry, 'id'>[]) => void
}) {
  const [tab, setTab] = useState<'ics' | 'json'>('ics')
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    try {
      const text = await file.text()
      const parsed = parseIcs(text)
      if (parsed.length === 0) throw new Error('Keine Termine in der Datei gefunden.')
      onImport(parsed)
      setCount(parsed.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Datei konnte nicht gelesen werden.')
    }
  }

  const handleJson = () => {
    setError(null)
    try {
      const parsed = parseJsonImport(jsonText)
      if (parsed.length === 0) throw new Error('Leeres Array.')
      onImport(parsed)
      setCount(parsed.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ungültiges JSON.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass w-full max-w-md p-5" style={{ background: 'var(--bg)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Teams-Kalender importieren</h3>
          <button type="button" aria-label="Schliessen" onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          {(['ics', 'json'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                setError(null)
                setCount(null)
              }}
              className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: tab === t ? 'var(--accent)' : 'var(--border)',
                background: tab === t ? 'var(--surface-strong)' : 'transparent',
                color: tab === t ? 'var(--ink)' : 'var(--muted)',
              }}
            >
              {t === 'ics' ? '.ics-Datei' : 'JSON einfügen'}
            </button>
          ))}
        </div>

        {tab === 'ics' ? (
          <div>
            <p className="mb-3 text-xs text-muted">
              Outlook → Kalender exportieren → .ics-Datei hier auswählen. Ein erneuter Import ersetzt alle
              bisherigen Teams-Termine im importierten Zeitraum.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".ics,text/calendar"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          </div>
        ) : (
          <div>
            <p className="mb-3 text-xs text-muted">
              JSON-Array im Format <code className="rounded bg-surface-strong px-1 py-0.5">{'{date, from, to, title, type:"teams"}'}</code> einfügen —
              z. B. aus einem Screenshot deines Teams-Kalenders.
            </p>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={6}
              className="w-full rounded-lg border border-border bg-surface-strong p-2 font-mono text-xs text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleJson}
              className="mt-2 w-full rounded-lg py-2 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              Importieren
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
        {count != null && !error && (
          <p className="mt-3 text-sm" style={{ color: 'var(--good)' }}>
            {count} Termin{count === 1 ? '' : 'e'} importiert.
          </p>
        )}
      </div>
    </div>
  )
}
