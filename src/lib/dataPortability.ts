const PREFIX = 'tagesplan.'

export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(PREFIX)) continue
    const raw = localStorage.getItem(key)
    try {
      data[key] = raw != null ? JSON.parse(raw) : null
    } catch {
      data[key] = raw
    }
  }
  return JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)
}

export function downloadExport() {
  const blob = new Blob([exportAllData()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tagesplan-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Restores every tagesplan.* key found in the export. Returns how many it wrote. */
export function importAllData(json: string): number {
  const parsed = JSON.parse(json)
  const data: Record<string, unknown> = parsed.data ?? parsed
  let count = 0
  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith(PREFIX)) continue
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    count++
  }
  return count
}

// ---------- migration from the old arbeitszeit_3.html localStorage format ----------

interface OldState {
  calc?: { start?: string; breakToday?: string; breakStart?: string; carry?: string; leave?: string; reqH?: string; reqM?: string }
  blocks?: { name?: string; from: string; to: string }[]
  events?: Record<string, { type: 'school' | 'work' | 'off'; title?: string; from: string; to: string }[]>
}

export function hasOldArbeitszeitData(): boolean {
  return localStorage.getItem('arbeitszeit_v2') != null
}

/** Maps the old single-file app's state into this app's keys. Returns a
 * summary of what was imported, or null if there was nothing to import. */
export function importOldArbeitszeitData(): { blocks: number; events: number } | null {
  const raw = localStorage.getItem('arbeitszeit_v2')
  if (!raw) return null
  let old: OldState
  try {
    old = JSON.parse(raw)
  } catch {
    return null
  }

  if (old.calc) {
    const current = JSON.parse(localStorage.getItem('tagesplan.zeitrechner.v1') ?? '{}')
    localStorage.setItem(
      'tagesplan.zeitrechner.v1',
      JSON.stringify({
        ...current,
        start: old.calc.start ?? current.start,
        pause: Number(old.calc.breakToday ?? current.pause) || current.pause,
        pauseAb: old.calc.breakStart ?? current.pauseAb,
        uebertrag: Number(old.calc.carry ?? current.uebertrag) || 0,
        gehzeit: old.calc.leave ?? current.gehzeit,
        sollH: Number(old.calc.reqH ?? current.sollH),
        sollM: Number(old.calc.reqM ?? current.sollM),
      }),
    )
  }

  let blockCount = 0
  if (old.blocks?.length) {
    const existing = JSON.parse(localStorage.getItem('tagesplan.blockzeiten.v1') ?? '[]')
    const mapped = old.blocks.map((b) => ({ id: crypto.randomUUID(), name: b.name || 'Block', from: b.from, to: b.to }))
    localStorage.setItem('tagesplan.blockzeiten.v1', JSON.stringify([...existing, ...mapped]))
    blockCount = mapped.length
  }

  let eventCount = 0
  if (old.events) {
    const existing = JSON.parse(localStorage.getItem('tagesplan.calendarEntries.v1') ?? '[]')
    const mapped = Object.entries(old.events).flatMap(([date, evs]) =>
      evs.map((e) => ({ id: crypto.randomUUID(), date, from: e.from, to: e.to, title: e.title ?? '', type: e.type })),
    )
    localStorage.setItem('tagesplan.calendarEntries.v1', JSON.stringify([...existing, ...mapped]))
    eventCount = mapped.length
  }

  return { blocks: blockCount, events: eventCount }
}
