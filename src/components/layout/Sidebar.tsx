import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  StickyNote,
  BarChart3,
  Clock,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays },
  { to: '/aufgaben', label: 'Aufgaben', icon: ListChecks },
  { to: '/notizen', label: 'Notizen', icon: StickyNote },
  { to: '/statistik', label: 'Statistik', icon: BarChart3 },
  { to: '/zeitrechner', label: 'Zeitrechner', icon: Clock },
  { to: '/einstellungen', label: 'Einstellungen', icon: Settings },
]

export function Sidebar() {
  const { mode, setMode } = useTheme()

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-y-0 left-0 z-30 flex w-[72px] flex-col items-center gap-1 border-r border-border/80 bg-surface py-5 backdrop-blur-xl"
    >
      <div
        className="mb-4 h-9 w-9 shrink-0 rounded-xl"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        aria-hidden="true"
      />

      <ul className="flex flex-1 flex-col items-center gap-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="group relative">
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                [
                  'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150',
                  isActive
                    ? 'text-accent-ink shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                    : 'text-muted hover:text-ink hover:bg-surface-strong',
                ].join(' ')
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }
                  : undefined
              }
            >
              <Icon size={20} strokeWidth={1.8} />
            </NavLink>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
            >
              {label}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={mode === 'dark' ? 'Helles Design' : 'Dunkles Design'}
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-strong hover:text-ink"
      >
        {mode === 'dark' ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
        >
          {mode === 'dark' ? 'Helles Design' : 'Dunkles Design'}
        </span>
      </button>
    </nav>
  )
}
