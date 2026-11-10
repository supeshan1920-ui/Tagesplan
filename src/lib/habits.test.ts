import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computeStreak, weekDates, ymd } from './habits'

describe('weekDates', () => {
  it('returns a Monday-first 7-day week containing the given date', () => {
    const days = weekDates(new Date(2026, 10, 10)) // a Tuesday
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(1) // Monday
    expect(days[6].getDay()).toBe(0) // Sunday
    expect(ymd(days[1])).toBe('2026-11-10') // Tuesday is the 2nd cell
  })
})

describe('computeStreak', () => {
  const FIXED_NOW = new Date(2026, 10, 10, 15, 0, 0) // Tuesday, mid-afternoon

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })
  afterEach(() => vi.useRealTimers())

  it('counts consecutive days ending yesterday when today is not yet marked', () => {
    const completions = { '2026-11-09': true, '2026-11-08': true, '2026-11-07': false }
    expect(computeStreak(completions)).toBe(2)
  })

  it('includes today once marked, without requiring it to not break the streak', () => {
    const completions = { '2026-11-10': true, '2026-11-09': true, '2026-11-08': true }
    expect(computeStreak(completions)).toBe(3)
  })

  it('is 0 when neither today nor yesterday are marked', () => {
    expect(computeStreak({ '2026-11-05': true })).toBe(0)
  })

  it('is 0 for no completions at all', () => {
    expect(computeStreak({})).toBe(0)
  })
})
