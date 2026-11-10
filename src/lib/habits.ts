export interface Habit {
  id: string
  name: string
  color: string // a CSS color value, e.g. 'var(--accent)' or a hex
}

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Monday-first 7 dates for the week containing `date`. */
export function weekDates(date: Date): Date[] {
  const d = new Date(date)
  const lead = (d.getDay() + 6) % 7 // Mon=0
  d.setDate(d.getDate() - lead)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d)
    day.setDate(d.getDate() + i)
    return day
  })
}

export const DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/** Current streak ending today (or yesterday, so missing "today so far" doesn't zero it). */
export function computeStreak(completions: Record<string, boolean>): number {
  let streak = 0
  const cursor = new Date()
  const todayKey = ymd(cursor)
  if (!completions[todayKey]) cursor.setDate(cursor.getDate() - 1) // allow today to still be open
  for (;;) {
    const key = ymd(cursor)
    if (!completions[key]) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
