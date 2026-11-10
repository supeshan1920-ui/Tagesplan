export type EntryType = 'school' | 'work' | 'off' | 'teams'

export interface CalendarEntry {
  id: string
  date: string // "YYYY-MM-DD"
  from: string // "HH:MM"
  to: string
  title: string
  type: EntryType
}

export const TYPE_LABEL: Record<EntryType, string> = {
  school: 'Schule',
  work: 'Arbeit',
  off: 'Frei',
  teams: 'Teams',
}

export const TYPE_COLOR_VAR: Record<EntryType, string> = {
  school: '--school',
  work: '--work',
  off: '--off',
  teams: '--accent-2',
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Monday-first 6x7 grid of Dates for the month containing `date`, including
 * lead/trail days from neighbouring months so every week is full. */
export function monthMatrix(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const leadDays = (first.getDay() + 6) % 7 // Mon=0
  const start = new Date(year, month, 1 - leadDays)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]
export const DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// ---------- .ics import ----------

function unfoldIcs(text: string): string {
  // RFC5545: a line starting with a space/tab is a continuation of the previous line
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
}

function parseIcsDate(raw: string): { date: string; time: string | null } {
  // forms: 20241128T090000Z | 20241128T090000 | 20241128 (all-day)
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/.exec(raw)
  if (!m) return { date: '', time: null }
  const [, y, mo, d, h, mi] = m
  const date = `${y}-${mo}-${d}`
  const time = h ? `${h}:${mi}` : null
  return { date, time }
}

/** Parses VEVENT blocks into CalendarEntry[] (type always 'teams'). Multi-day
 * events are clamped to their start date only — good enough for meeting
 * imports, which is the only use case here. */
export function parseIcs(text: string): Omit<CalendarEntry, 'id'>[] {
  const unfolded = unfoldIcs(text)
  const events = unfolded.split('BEGIN:VEVENT').slice(1)
  const out: Omit<CalendarEntry, 'id'>[] = []

  for (const block of events) {
    const body = block.split('END:VEVENT')[0]
    const getField = (name: string) => {
      const re = new RegExp(`^${name}(?:;[^:]*)?:(.*)$`, 'm')
      return re.exec(body)?.[1]?.trim()
    }
    const summary = getField('SUMMARY')?.replace(/\\,/g, ',').replace(/\\n/gi, ' ') ?? 'Teams-Termin'
    const dtstart = getField('DTSTART')
    const dtend = getField('DTEND')
    if (!dtstart) continue
    const start = parseIcsDate(dtstart)
    const end = dtend ? parseIcsDate(dtend) : null
    if (!start.date) continue

    out.push({
      date: start.date,
      from: start.time ?? '00:00',
      to: end?.time ?? start.time ?? '23:59',
      title: summary,
      type: 'teams',
    })
  }
  return out
}

// ---------- JSON import ----------

export interface JsonImportEntry {
  date: string
  from: string
  to: string
  title: string
  type: 'teams'
}

export function parseJsonImport(text: string): Omit<CalendarEntry, 'id'>[] {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error('Erwartet ein JSON-Array.')
  return parsed.map((e: JsonImportEntry, i: number) => {
    if (!e.date || !e.from || !e.to) throw new Error(`Eintrag ${i + 1} ist unvollständig.`)
    return { date: e.date, from: e.from, to: e.to, title: e.title ?? 'Teams-Termin', type: 'teams' as const }
  })
}
