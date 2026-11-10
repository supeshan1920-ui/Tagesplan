import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { pickReadableInk } from '../lib/color'

export type ThemeMode = 'dark' | 'light'

export interface ThemeColors {
  accent: string
  accent2: string
  bg: string
}

const DEFAULT_COLORS: ThemeColors = { accent: '#8b5cf6', accent2: '#c084fc', bg: '#0a0b16' }
const STORAGE_KEY = 'tagesplan.theme.v1'

interface StoredTheme {
  mode: ThemeMode
  colors: ThemeColors
  glassOpacity: number // 0..1, drives --surface alpha
}

const DEFAULT_STORED: StoredTheme = { mode: 'dark', colors: DEFAULT_COLORS, glassOpacity: 0.045 }

interface ThemeContextValue extends StoredTheme {
  setMode: (mode: ThemeMode) => void
  setColor: (key: keyof ThemeColors, value: string) => void
  setGlassOpacity: (value: number) => void
  reset: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function loadStored(): StoredTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STORED
    const parsed = JSON.parse(raw)
    return {
      mode: parsed.mode === 'light' ? 'light' : 'dark',
      colors: { ...DEFAULT_COLORS, ...parsed.colors },
      glassOpacity: typeof parsed.glassOpacity === 'number' ? parsed.glassOpacity : DEFAULT_STORED.glassOpacity,
    }
  } catch {
    return DEFAULT_STORED
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredTheme>(loadStored)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    const root = document.documentElement
    if (state.mode === 'light') root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
    root.style.setProperty('--accent', state.colors.accent)
    root.style.setProperty('--accent-2', state.colors.accent2)
    // Text/icons placed on top of an accent-coloured fill (buttons, the
    // active sidebar item, etc.) need to flip between light and dark
    // depending on how light the chosen accent itself is — a bright accent
    // (e.g. cyan) with hardcoded white text fails AA contrast outright.
    // Worst-case across both gradient stops, since most accent-coloured UI
    // here is a 135deg accent->accent2 gradient, not a flat fill.
    root.style.setProperty('--accent-ink', pickReadableInk(state.colors.accent, state.colors.accent2))
    // The custom "Hintergrund" colour is a dark-mode glow colour (that's what
    // the colour wheel edits in the reference). Light mode has its own fixed,
    // readable background in CSS — an inline override here would always win
    // over that stylesheet rule and silently break light mode's contrast.
    if (state.mode === 'dark') root.style.setProperty('--bg', state.colors.bg)
    else root.style.removeProperty('--bg')
    const surfaceBase = state.mode === 'light' ? '20, 16, 40' : '255, 255, 255'
    root.style.setProperty('--surface', `rgba(${surfaceBase}, ${state.glassOpacity})`)
    root.style.setProperty('--surface-strong', `rgba(${surfaceBase}, ${Math.min(state.glassOpacity * 1.8, 1)})`)
  }, [state])

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...state,
      setMode: (mode) => setState((s) => ({ ...s, mode })),
      setColor: (key, value) => setState((s) => ({ ...s, colors: { ...s.colors, [key]: value } })),
      setGlassOpacity: (value) => setState((s) => ({ ...s, glassOpacity: value })),
      reset: () => setState(DEFAULT_STORED),
    }),
    [state],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
