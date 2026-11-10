import { useEffect, useState } from 'react'
import { DEFAULT_PAUSENZEITEN, type Blockzeit, type Pausenzeit } from './pausenzeiten'

const PAUSEN_KEY = 'tagesplan.pausenzeiten.v1'
const BLOCK_KEY = 'tagesplan.blockzeiten.v1'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return fallback
}

export function usePausenzeiten() {
  const [list, setList] = useState<Pausenzeit[]>(() => load(PAUSEN_KEY, DEFAULT_PAUSENZEITEN))

  useEffect(() => {
    localStorage.setItem(PAUSEN_KEY, JSON.stringify(list))
  }, [list])

  return {
    list,
    add: (p: Omit<Pausenzeit, 'id'>) => setList((l) => [...l, { ...p, id: crypto.randomUUID() }]),
    update: (id: string, patch: Partial<Pausenzeit>) =>
      setList((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    remove: (id: string) => setList((l) => l.filter((p) => p.id !== id)),
  }
}

export function useBlockzeiten() {
  const [list, setList] = useState<Blockzeit[]>(() => load(BLOCK_KEY, [] as Blockzeit[]))

  useEffect(() => {
    localStorage.setItem(BLOCK_KEY, JSON.stringify(list))
  }, [list])

  return {
    list,
    add: (b: Omit<Blockzeit, 'id'>) => setList((l) => [...l, { ...b, id: crypto.randomUUID() }]),
    update: (id: string, patch: Partial<Blockzeit>) =>
      setList((l) => l.map((b) => (b.id === id ? { ...b, ...patch } : b))),
    remove: (id: string) => setList((l) => l.filter((b) => b.id !== id)),
  }
}
