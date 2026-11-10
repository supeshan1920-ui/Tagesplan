import { useEffect, useState } from 'react'
import type { Task } from './tasks'

const KEY = 'tagesplan.tasks.v1'

function load(): Task[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(tasks))
  }, [tasks])

  const add = (t: Omit<Task, 'id' | 'createdAt' | 'done' | 'starred'>) =>
    setTasks((list) => [
      ...list,
      { ...t, id: crypto.randomUUID(), createdAt: Date.now(), done: false, starred: false },
    ])

  const update = (id: string, patch: Partial<Task>) =>
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const remove = (id: string) => setTasks((list) => list.filter((t) => t.id !== id))

  return { tasks, add, update, remove }
}
