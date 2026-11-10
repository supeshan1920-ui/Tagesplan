import { useEffect, useState } from 'react'
import type { CalendarEntry } from './calendar'

const ENTRIES_KEY = 'tagesplan.calendarEntries.v1'
const SYNC_KEY = 'tagesplan.teamsLastSync.v1'

function load(): CalendarEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

export function useCalendarEntries() {
  const [entries, setEntries] = useState<CalendarEntry[]>(load)
  const [lastTeamsSync, setLastTeamsSync] = useState<string | null>(() =>
    localStorage.getItem(SYNC_KEY),
  )

  useEffect(() => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  }, [entries])

  const add = (e: Omit<CalendarEntry, 'id'>) =>
    setEntries((list) => [...list, { ...e, id: crypto.randomUUID() }])

  const update = (id: string, patch: Partial<CalendarEntry>) =>
    setEntries((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const remove = (id: string) => setEntries((list) => list.filter((e) => e.id !== id))

  /** Replaces every existing 'teams' entry whose date falls inside the
   * imported batch's own date range with the freshly imported ones — the
   * "re-import replaces previous Teams data, no duplicates" rule. */
  const importTeams = (imported: Omit<CalendarEntry, 'id'>[]) => {
    if (imported.length === 0) return
    const dates = imported.map((e) => e.date).sort()
    const minDate = dates[0]
    const maxDate = dates[dates.length - 1]
    setEntries((list) => [
      ...list.filter((e) => !(e.type === 'teams' && e.date >= minDate && e.date <= maxDate)),
      ...imported.map((e) => ({ ...e, id: crypto.randomUUID() })),
    ])
    const now = new Date().toISOString()
    localStorage.setItem(SYNC_KEY, now)
    setLastTeamsSync(now)
  }

  return { entries, add, update, remove, importTeams, lastTeamsSync }
}
