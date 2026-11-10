import { useState } from 'react'
import { Upload } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { MonthGrid } from '../components/calendar/MonthGrid'
import { DayPanel } from '../components/calendar/DayPanel'
import { ImportDialog } from '../components/calendar/ImportDialog'
import { useCalendarEntries } from '../lib/useCalendarEntries'
import { ymd } from '../lib/calendar'

export function KalenderPage() {
  const { entries, add, remove, importTeams, lastTeamsSync } = useCalendarEntries()
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState(() => ymd(new Date()))
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Kalender</h1>
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink hover:border-[var(--accent)]"
        >
          <Upload size={15} /> Teams importieren
        </button>
      </div>

      {lastTeamsSync && (
        <p className="-mt-3 text-xs text-muted">
          Zuletzt aktualisiert: {new Date(lastTeamsSync).toLocaleString('de-CH')}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <GlassCard>
          <MonthGrid
            cursor={cursor}
            onCursorChange={setCursor}
            selected={selected}
            onSelect={setSelected}
            entries={entries}
          />
        </GlassCard>

        <GlassCard>
          <DayPanel
            dateKey={selected}
            entries={entries}
            onAdd={(e) => add({ ...e, date: selected })}
            onRemove={remove}
          />
        </GlassCard>
      </div>

      {importOpen && (
        <ImportDialog
          onClose={() => setImportOpen(false)}
          onImport={(imported) => importTeams(imported)}
        />
      )}
    </div>
  )
}
