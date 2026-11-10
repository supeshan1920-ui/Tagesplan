import { useEffect, useState } from 'react'
import type { Habit } from './habits'

const HABITS_KEY = 'tagesplan.habits.v1'
const COMPLETIONS_KEY = 'tagesplan.habitCompletions.v1' // { [habitId]: { [dateKey]: true } }

const DEFAULT_HABITS: Habit[] = [
  { id: 'lernen', name: 'Lernen', color: 'var(--accent)' },
  { id: 'sport', name: 'Sport', color: 'var(--work)' },
  { id: 'lesen', name: 'Lesen', color: 'var(--good)' },
]

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return fallback
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => load(HABITS_KEY, DEFAULT_HABITS))
  const [completions, setCompletions] = useState<Record<string, Record<string, boolean>>>(() =>
    load(COMPLETIONS_KEY, {}),
  )

  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
  }, [habits])
  useEffect(() => {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions))
  }, [completions])

  const addHabit = (name: string, color: string) =>
    setHabits((list) => [...list, { id: crypto.randomUUID(), name, color }])
  const removeHabit = (id: string) => setHabits((list) => list.filter((h) => h.id !== id))

  const toggle = (habitId: string, dateKey: string) =>
    setCompletions((c) => {
      const forHabit = { ...(c[habitId] ?? {}) }
      if (forHabit[dateKey]) delete forHabit[dateKey]
      else forHabit[dateKey] = true
      return { ...c, [habitId]: forHabit }
    })

  return { habits, completions, addHabit, removeHabit, toggle }
}
