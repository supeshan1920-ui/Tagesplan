import { useEffect, useState } from 'react'
import { DEFAULT_FLOOR_MIN, DEFAULT_SOLL_MIN, formatTime, parseTime } from './zeitrechner'

const KEY = 'tagesplan.zeitrechner.v1'

export interface ZeitrechnerState {
  start: string // "HH:MM"
  pause: number // minutes
  pauseAb: string // "HH:MM" or ''
  uebertrag: number
  gehzeit: string
  sollH: number
  sollM: number
  floor: string // "HH:MM"
}

export const DEFAULT_ZEITRECHNER_STATE: ZeitrechnerState = {
  start: '07:30',
  pause: 30,
  pauseAb: '',
  uebertrag: 0,
  gehzeit: '16:30',
  sollH: Math.floor(DEFAULT_SOLL_MIN / 60),
  sollM: DEFAULT_SOLL_MIN % 60,
  floor: formatTime(DEFAULT_FLOOR_MIN),
}

function load(): ZeitrechnerState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_ZEITRECHNER_STATE, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return DEFAULT_ZEITRECHNER_STATE
}

export function useZeitrechnerState() {
  const [state, setState] = useState<ZeitrechnerState>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const update = <K extends keyof ZeitrechnerState>(key: K, value: ZeitrechnerState[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const reset = () =>
    setState((s) => ({
      ...s,
      sollH: DEFAULT_ZEITRECHNER_STATE.sollH,
      sollM: DEFAULT_ZEITRECHNER_STATE.sollM,
      pause: DEFAULT_ZEITRECHNER_STATE.pause,
      uebertrag: DEFAULT_ZEITRECHNER_STATE.uebertrag,
      pauseAb: DEFAULT_ZEITRECHNER_STATE.pauseAb,
    }))

  return { state, update, reset }
}

export function toCalcInput(s: ZeitrechnerState) {
  return {
    startMin: parseTime(s.start) ?? 0,
    pauseMin: s.pause,
    pauseAbMin: parseTime(s.pauseAb),
    uebertragMin: s.uebertrag,
    gehzeitMin: parseTime(s.gehzeit),
    sollMin: s.sollH * 60 + s.sollM,
    floorMin: parseTime(s.floor) ?? DEFAULT_FLOOR_MIN,
  }
}
