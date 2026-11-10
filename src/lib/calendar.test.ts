import { describe, expect, it } from 'vitest'
import { monthMatrix, parseIcs, parseJsonImport, ymd } from './calendar'

describe('ymd', () => {
  it('formats with zero-padded month/day', () => {
    expect(ymd(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('monthMatrix', () => {
  it('returns 42 cells, Monday-first', () => {
    const days = monthMatrix(2026, 10) // November 2026, starts on a Sunday
    expect(days).toHaveLength(42)
    expect(days[0].getDay()).toBe(1) // first cell is a Monday
  })
})

describe('parseIcs', () => {
  it('parses a basic VEVENT with timed start/end', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'SUMMARY:Standup',
      'DTSTART:20261112T090000',
      'DTEND:20261112T093000',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const entries = parseIcs(ics)
    expect(entries).toEqual([{ date: '2026-11-12', from: '09:00', to: '09:30', title: 'Standup', type: 'teams' }])
  })

  it('unfolds continuation lines per RFC5545', () => {
    const ics = ['BEGIN:VEVENT', 'SUMMARY:Very long meeting title that', ' continues here', 'DTSTART:20261112T090000', 'END:VEVENT'].join(
      '\r\n',
    )
    const entries = parseIcs(ics)
    expect(entries[0].title).toBe('Very long meeting title thatcontinues here')
  })

  it('falls back to a default title and ignores events with no DTSTART', () => {
    const ics = ['BEGIN:VEVENT', 'DTEND:20261112T100000', 'END:VEVENT'].join('\r\n')
    expect(parseIcs(ics)).toEqual([])
  })

  it('parses multiple events in one file', () => {
    const ics = [
      'BEGIN:VEVENT',
      'SUMMARY:A',
      'DTSTART:20261112T090000',
      'DTEND:20261112T093000',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:B',
      'DTSTART:20261113T140000',
      'DTEND:20261113T150000',
      'END:VEVENT',
    ].join('\r\n')
    expect(parseIcs(ics)).toHaveLength(2)
  })
})

describe('parseJsonImport', () => {
  it('parses a valid array', () => {
    const json = JSON.stringify([{ date: '2026-11-12', from: '09:00', to: '10:00', title: 'Standup', type: 'teams' }])
    expect(parseJsonImport(json)).toEqual([{ date: '2026-11-12', from: '09:00', to: '10:00', title: 'Standup', type: 'teams' }])
  })

  it('defaults a missing title', () => {
    const json = JSON.stringify([{ date: '2026-11-12', from: '09:00', to: '10:00', type: 'teams' }])
    expect(parseJsonImport(json)[0].title).toBe('Teams-Termin')
  })

  it('throws on a non-array payload', () => {
    expect(() => parseJsonImport('{"not":"an array"}')).toThrow()
  })

  it('throws when a required field is missing', () => {
    const json = JSON.stringify([{ date: '2026-11-12', from: '09:00' }])
    expect(() => parseJsonImport(json)).toThrow()
  })
})
