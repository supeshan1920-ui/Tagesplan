export interface Pausenzeit {
  id: string
  name: string
  from: string // "HH:MM"
  to: string
  weekdays: number[] // 1=Mo .. 7=So (ISO), matches date.getDay() with 0->7
}

export const DEFAULT_PAUSENZEITEN: Pausenzeit[] = [
  { id: 'znueni', name: 'Znüni', from: '09:30', to: '09:45', weekdays: [1, 2, 3, 4, 5] },
  { id: 'mittag', name: 'Mittag', from: '12:00', to: '12:45', weekdays: [1, 2, 3, 4, 5] },
  { id: 'zvieri', name: 'Zvieri', from: '15:00', to: '15:15', weekdays: [1, 2, 3, 4, 5] },
]

export interface Blockzeit {
  id: string
  name: string
  from: string
  to: string
}

function isoWeekday(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 7 : d
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function pausenForDay(pausenzeiten: Pausenzeit[], date: Date): Pausenzeit[] {
  const wd = isoWeekday(date)
  return pausenzeiten
    .filter((p) => p.weekdays.includes(wd))
    .slice()
    .sort((a, b) => toMin(a.from) - toMin(b.from))
}

export type CountdownState =
  | { kind: 'before-pause'; pause: Pausenzeit; secondsLeft: number }
  | { kind: 'in-pause'; pause: Pausenzeit; secondsLeft: number }
  | { kind: 'to-feierabend'; secondsLeft: number; done: boolean }

/** nowMin/nowSec let the countdown tick to real seconds, not just minutes. */
export function computeCountdown(
  pausenzeiten: Pausenzeit[],
  now: Date,
  feierabendMin: number,
): CountdownState {
  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const todays = pausenForDay(pausenzeiten, now)

  for (const p of todays) {
    const fromS = toMin(p.from) * 60
    const toS = toMin(p.to) * 60
    if (nowSeconds < fromS) {
      return { kind: 'before-pause', pause: p, secondsLeft: fromS - nowSeconds }
    }
    if (nowSeconds >= fromS && nowSeconds < toS) {
      return { kind: 'in-pause', pause: p, secondsLeft: toS - nowSeconds }
    }
  }

  const feierabendS = feierabendMin * 60
  const secondsLeft = feierabendS - nowSeconds
  return { kind: 'to-feierabend', secondsLeft: Math.max(0, secondsLeft), done: secondsLeft <= 0 }
}

export function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
