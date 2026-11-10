// Core Zeitrechner math, ported 1:1 from arbeitszeit_3.html's calc().
// Every value in/out is minutes since midnight unless noted. Kept dependency-free
// and side-effect-free so it can be unit tested in isolation (see zeitrechner.test.ts).

export const DEFAULT_SOLL_MIN = 8 * 60 + 12 // 8:12
export const DEFAULT_FLOOR_MIN = 16 * 60 // 16:00

export interface ZeitrechnerInput {
  startMin: number
  pauseMin: number
  /** Minute the pause starts, if the user filled it in (for "Pause zurück um"). */
  pauseAbMin?: number | null
  /** Saldo Übertrag from the previous day; negative = owed, positive = banked. */
  uebertragMin: number
  /** Time the user actually leaves, if entered yet. */
  gehzeitMin?: number | null
  sollMin?: number
  floorMin?: number
}

export interface ZeitrechnerResult {
  feierabendMin: number
  ohneSaldoMin: number
  pauseZurueckMin: number | null
  saldoHeuteMin: number | null
  saldoTotalMin: number | null
}

export function calcZeitrechner(input: ZeitrechnerInput): ZeitrechnerResult {
  const soll = input.sollMin ?? DEFAULT_SOLL_MIN
  const floor = input.floorMin ?? DEFAULT_FLOOR_MIN
  const { startMin, pauseMin, uebertragMin } = input

  // natural end with saldo (Übertrag) applied, then floored
  const natEnd = startMin + soll + pauseMin - uebertragMin
  const feierabendMin = Math.max(natEnd, floor)

  // end ignoring saldo, still floored
  const natEndNoSaldo = startMin + soll + pauseMin
  const ohneSaldoMin = Math.max(natEndNoSaldo, floor)

  const pauseZurueckMin =
    input.pauseAbMin != null ? input.pauseAbMin + pauseMin : null

  let saldoHeuteMin: number | null = null
  let saldoTotalMin: number | null = null
  if (input.gehzeitMin != null) {
    const worked = input.gehzeitMin - startMin - pauseMin
    saldoHeuteMin = worked - soll
    saldoTotalMin = saldoHeuteMin + uebertragMin
  }

  return { feierabendMin, ohneSaldoMin, pauseZurueckMin, saldoHeuteMin, saldoTotalMin }
}

/** "HH:MM" -> minutes since midnight (wraps negative/>=1440 like the old app). */
export function parseTime(hhmm: string): number | null {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/** minutes since midnight -> "HH:MM", wrapping into a 24h clock. */
export function formatTime(min: number): string {
  const wrapped = ((min % 1440) + 1440) % 1440
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** signed minute delta -> "+12 Min" / "−5 Min" / "0 Min". */
export function formatSigned(min: number): string {
  const sign = min > 0 ? '+' : min < 0 ? '−' : ''
  return `${sign}${Math.abs(min)} Min`
}

export function signClass(min: number): 'plus' | 'minus' | 'neutral' {
  return min > 0 ? 'plus' : min < 0 ? 'minus' : 'neutral'
}
