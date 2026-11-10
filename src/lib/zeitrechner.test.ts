import { describe, expect, it } from 'vitest'
import { calcZeitrechner, formatSigned, formatTime, parseTime } from './zeitrechner'

const t = (hhmm: string) => parseTime(hhmm)!

describe('calcZeitrechner — matches arbeitszeit_3.html exactly', () => {
  it('Start 07:30, Pause 30, Übertrag 0 -> Feierabend 16:12, Ohne Saldo 16:12', () => {
    const r = calcZeitrechner({ startMin: t('07:30'), pauseMin: 30, uebertragMin: 0 })
    expect(formatTime(r.feierabendMin)).toBe('16:12')
    expect(formatTime(r.ohneSaldoMin)).toBe('16:12')
  })

  it('Start 07:00, Pause 30, Übertrag 0 -> Feierabend 16:00 (floor)', () => {
    const r = calcZeitrechner({ startMin: t('07:00'), pauseMin: 30, uebertragMin: 0 })
    expect(formatTime(r.feierabendMin)).toBe('16:00')
  })

  it('Start 07:30, Pause 30, Übertrag 20 -> Feierabend 16:00 (15:52 floored)', () => {
    const r = calcZeitrechner({ startMin: t('07:30'), pauseMin: 30, uebertragMin: 20 })
    expect(formatTime(r.feierabendMin)).toBe('16:00')
  })

  it('Start 07:30, Pause 30, Gehzeit 16:30, Übertrag 10 -> Saldo heute +18, total +28', () => {
    const r = calcZeitrechner({
      startMin: t('07:30'),
      pauseMin: 30,
      uebertragMin: 10,
      gehzeitMin: t('16:30'),
    })
    expect(r.saldoHeuteMin).toBe(18)
    expect(r.saldoTotalMin).toBe(28)
    expect(formatSigned(r.saldoHeuteMin!)).toBe('+18 Min')
    expect(formatSigned(r.saldoTotalMin!)).toBe('+28 Min')
  })

  it('Pause ab 12:00, Pause 45 -> Pause zurück um 12:45', () => {
    const r = calcZeitrechner({
      startMin: t('07:30'),
      pauseMin: 45,
      uebertragMin: 0,
      pauseAbMin: t('12:00'),
    })
    expect(formatTime(r.pauseZurueckMin!)).toBe('12:45')
  })

  it('respects a custom Soll and floor instead of the defaults', () => {
    const r = calcZeitrechner({
      startMin: t('08:00'),
      pauseMin: 30,
      uebertragMin: 0,
      sollMin: 8 * 60,
      floorMin: 17 * 60,
    })
    // natural end 08:00 + 8:00 + 0:30 = 16:30, floored up to 17:00
    expect(formatTime(r.feierabendMin)).toBe('17:00')
  })

  it('leaves saldo fields null when Gehzeit is not set', () => {
    const r = calcZeitrechner({ startMin: t('07:30'), pauseMin: 30, uebertragMin: 0 })
    expect(r.saldoHeuteMin).toBeNull()
    expect(r.saldoTotalMin).toBeNull()
  })

  it('leaves Pause zurück null when Pause ab is not set', () => {
    const r = calcZeitrechner({ startMin: t('07:30'), pauseMin: 30, uebertragMin: 0 })
    expect(r.pauseZurueckMin).toBeNull()
  })
})

describe('formatTime', () => {
  it('pads single-digit hours and minutes', () => {
    expect(formatTime(5 * 60 + 9)).toBe('05:09')
  })
  it('wraps past midnight', () => {
    expect(formatTime(25 * 60)).toBe('01:00')
  })
})

describe('formatSigned', () => {
  it('uses a real minus sign for negatives and no sign for zero', () => {
    expect(formatSigned(-5)).toBe('−5 Min')
    expect(formatSigned(0)).toBe('0 Min')
    expect(formatSigned(7)).toBe('+7 Min')
  })
})
