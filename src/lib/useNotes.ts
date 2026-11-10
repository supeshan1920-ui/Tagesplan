import { useEffect, useState } from 'react'

export interface Note {
  id: string
  text: string
  createdAt: number
}

const KEY = 'tagesplan.notes.v1'

function load(): Note[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(notes))
  }, [notes])

  const add = (text: string) =>
    setNotes((list) => [{ id: crypto.randomUUID(), text, createdAt: Date.now() }, ...list])

  const update = (id: string, text: string) =>
    setNotes((list) => list.map((n) => (n.id === id ? { ...n, text } : n)))

  const remove = (id: string) => setNotes((list) => list.filter((n) => n.id !== id))

  return { notes, add, update, remove }
}
