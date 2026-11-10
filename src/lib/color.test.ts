import { describe, expect, it } from 'vitest'
import { hexToRgb, hsvToRgb, pickReadableInk, rgbToHex, rgbToHsv } from './color'

describe('hex <-> rgb round-trip', () => {
  it('converts both directions losslessly', () => {
    expect(hexToRgb('#8b5cf6')).toEqual({ r: 139, g: 92, b: 246 })
    expect(rgbToHex({ r: 139, g: 92, b: 246 })).toBe('#8b5cf6')
  })

  it('returns null for an invalid hex', () => {
    expect(hexToRgb('not-a-color')).toBeNull()
  })
})

describe('hsv <-> rgb round-trip', () => {
  it('recovers the same hue/saturation/value after a round trip', () => {
    const rgb = hexToRgb('#06b6d4')!
    const hsv = rgbToHsv(rgb)
    const back = hsvToRgb(hsv)
    // allow 1-unit rounding slack per channel
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1)
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1)
  })
})

describe('pickReadableInk — this is the regression guard for the AA-contrast fix', () => {
  it('picks dark text for a light accent (cyan) — white was measured at 2.43:1, failing AA', () => {
    expect(pickReadableInk('#06b6d4')).toBe('#0c0a08')
  })

  it('picks dark text for the default violet/light-purple gradient — white failed on the accent2 stop (2.65:1)', () => {
    expect(pickReadableInk('#8b5cf6', '#c084fc')).toBe('#0c0a08')
  })

  it('picks white text for a genuinely dark background', () => {
    expect(pickReadableInk('#1a1a2e')).toBe('#ffffff')
  })

  it('falls back to white when given no valid colours', () => {
    expect(pickReadableInk('garbage')).toBe('#ffffff')
  })
})
