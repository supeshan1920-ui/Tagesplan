import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { daysUntil, dueLabel, matchesFilter, type Task } from './tasks'

const FIXED_NOW = new Date(2026, 10, 10, 12, 0, 0) // 2026-11-10, a Tuesday

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})
afterEach(() => vi.useRealTimers())

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'Test',
    done: false,
    starred: false,
    dueDate: null,
    kind: 'aufgabe',
    priority: null,
    createdAt: Date.now(),
    completedAt: null,
    ...overrides,
  }
}

describe('daysUntil / dueLabel', () => {
  it('is 0 for today, positive for the future, negative for the past', () => {
    expect(daysUntil('2026-11-10')).toBe(0)
    expect(daysUntil('2026-11-13')).toBe(3)
    expect(daysUntil('2026-11-08')).toBe(-2)
  })

  it('labels an overdue date in red-flagged form', () => {
    expect(dueLabel('2026-11-09')).toEqual({ text: '1 Tag überfällig', overdue: true })
    expect(dueLabel('2026-11-05')).toEqual({ text: '5 Tage überfällig', overdue: true })
  })

  it('labels today/tomorrow specially, otherwise "fällig in X Tagen"', () => {
    expect(dueLabel('2026-11-10').text).toBe('Heute fällig')
    expect(dueLabel('2026-11-11').text).toBe('Morgen fällig')
    expect(dueLabel('2026-11-15').text).toBe('fällig in 5 Tagen')
  })
})

describe('matchesFilter', () => {
  it('alle = open tasks, erledigt = done tasks', () => {
    const open = makeTask({ done: false })
    const done = makeTask({ done: true })
    expect(matchesFilter(open, 'alle')).toBe(true)
    expect(matchesFilter(done, 'alle')).toBe(false)
    expect(matchesFilter(done, 'erledigt')).toBe(true)
    expect(matchesFilter(open, 'erledigt')).toBe(false)
  })

  it('heute = open with due date today or overdue', () => {
    expect(matchesFilter(makeTask({ dueDate: '2026-11-10' }), 'heute')).toBe(true)
    expect(matchesFilter(makeTask({ dueDate: '2026-11-08' }), 'heute')).toBe(true)
    expect(matchesFilter(makeTask({ dueDate: '2026-11-11' }), 'heute')).toBe(false)
    expect(matchesFilter(makeTask({ dueDate: null }), 'heute')).toBe(false)
  })

  it('bald = open with due date 1-7 days out', () => {
    expect(matchesFilter(makeTask({ dueDate: '2026-11-12' }), 'bald')).toBe(true)
    expect(matchesFilter(makeTask({ dueDate: '2026-11-17' }), 'bald')).toBe(true)
    expect(matchesFilter(makeTask({ dueDate: '2026-11-18' }), 'bald')).toBe(false)
    expect(matchesFilter(makeTask({ dueDate: '2026-11-10' }), 'bald')).toBe(false) // today belongs to 'heute'
  })

  it('done tasks never match heute/bald, only erledigt', () => {
    const done = makeTask({ done: true, dueDate: '2026-11-10' })
    expect(matchesFilter(done, 'heute')).toBe(false)
    expect(matchesFilter(done, 'bald')).toBe(false)
  })
})
