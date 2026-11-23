import { describe, expect, it } from 'vitest'
import { computeCountdown, secondsUntil, DEFAULT_PAUSENZEITEN } from './pausenzeiten'

const at = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2026, 0, 5, h, m, 0) // Monday
}

describe('secondsUntil', () => {
  it('counts down the seconds to a time-of-day target', () => {
    const r = secondsUntil(16 * 60 + 12, at('16:10'))
    expect(r.secondsLeft).toBe(120)
    expect(r.done).toBe(false)
  })

  it('is done (0 left) once the target has passed', () => {
    const r = secondsUntil(16 * 60, at('16:05'))
    expect(r.secondsLeft).toBe(0)
    expect(r.done).toBe(true)
  })

  it('holds at the full duration before notBeforeMin (Startzeit) arrives', () => {
    // 06:00, Start 07:30, target 16:12 -> stays at 16:12-07:30, not 16:12-06:00
    const r = secondsUntil(16 * 60 + 12, at('06:00'), 7 * 60 + 30)
    expect(r.secondsLeft).toBe((16 * 60 + 12 - (7 * 60 + 30)) * 60)
  })

  it('ticks normally again once now reaches/passes notBeforeMin', () => {
    const r = secondsUntil(16 * 60 + 12, at('10:00'), 7 * 60 + 30)
    expect(r.secondsLeft).toBe((16 * 60 + 12 - 10 * 60) * 60)
  })
})

describe('computeCountdown falls back to feierabend once breaks are over', () => {
  it('counts down to the next break first', () => {
    const c = computeCountdown(DEFAULT_PAUSENZEITEN, at('09:00'), 16 * 60 + 12)
    expect(c.kind).toBe('before-pause')
  })

  it('falls through to feierabend after the last break of the day', () => {
    const c = computeCountdown(DEFAULT_PAUSENZEITEN, at('15:30'), 16 * 60 + 12)
    expect(c.kind).toBe('to-feierabend')
  })
})
