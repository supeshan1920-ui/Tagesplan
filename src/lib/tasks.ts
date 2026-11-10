export type Priority = 'hoch' | 'mittel' | 'tief'

export interface Task {
  id: string
  title: string
  done: boolean
  starred: boolean
  dueDate: string | null // "YYYY-MM-DD"
  kind: 'aufgabe' | 'abgabe'
  priority: Priority | null // only meaningful for 'abgabe'
  createdAt: number
  completedAt: number | null
}

export type TaskFilter = 'alle' | 'heute' | 'bald' | 'erledigt'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysUntil(dueDate: string): number {
  const today = new Date(todayKey() + 'T00:00:00')
  const due = new Date(dueDate + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

export function dueLabel(dueDate: string): { text: string; overdue: boolean } {
  const n = daysUntil(dueDate)
  if (n < 0) return { text: `${Math.abs(n)} Tag${Math.abs(n) === 1 ? '' : 'e'} überfällig`, overdue: true }
  if (n === 0) return { text: 'Heute fällig', overdue: false }
  if (n === 1) return { text: 'Morgen fällig', overdue: false }
  return { text: `fällig in ${n} Tagen`, overdue: false }
}

export function matchesFilter(task: Task, filter: TaskFilter): boolean {
  if (filter === 'alle') return !task.done
  if (filter === 'erledigt') return task.done
  if (task.done) return false
  if (!task.dueDate) return false
  const n = daysUntil(task.dueDate)
  if (filter === 'heute') return n <= 0
  if (filter === 'bald') return n > 0 && n <= 7
  return true
}

export const PRIORITY_LABEL: Record<Priority, string> = { hoch: 'Hoch', mittel: 'Mittel', tief: 'Tief' }
export const PRIORITY_COLOR_VAR: Record<Priority, string> = {
  hoch: '--danger',
  mittel: '--warn',
  tief: '--good',
}
