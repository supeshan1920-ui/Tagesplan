export interface RGB { r: number; g: number; b: number }
export interface HSV { h: number; s: number; v: number } // h: 0-360, s/v: 0-1

export function hsvToRgb({ h, s, v }: HSV): RGB {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) }
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6)
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2)
    else h = 60 * ((rn - gn) / delta + 4)
  }
  if (h < 0) h += 360
  const s = max === 0 ? 0 : delta / max
  return { h, s, v: max }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('')}`
}

export function hexToRgb(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function relativeLuminance({ r, g, b }: RGB): number {
  const [rl, gl, bl] = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function contrastRatio(a: RGB, b: RGB): number {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** Picks whichever of near-white/near-black gives the better *worst-case*
 * AA contrast across one or more background colours (pass both gradient
 * stops for a two-colour button background) — so "white text on accent"
 * buttons stay legible no matter which accent the colour wheel lands on. */
export function pickReadableInk(...bgHexes: string[]): string {
  const bgs = bgHexes.map(hexToRgb).filter((c): c is RGB => c != null)
  if (bgs.length === 0) return '#ffffff'
  const white: RGB = { r: 255, g: 255, b: 255 }
  const black: RGB = { r: 12, g: 10, b: 8 }
  const worstCase = (ink: RGB) => Math.min(...bgs.map((bg) => contrastRatio(ink, bg)))
  return worstCase(white) >= worstCase(black) ? '#ffffff' : '#0c0a08'
}
