import { useEffect, useRef, useState } from 'react'
import { geocodeCity, type GeoResult } from '../../lib/weather'

export function LocationSearch({
  current,
  onSelect,
}: {
  current: GeoResult
  onSelect: (loc: GeoResult) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    timer.current = setTimeout(() => {
      geocodeCity(query).then(setResults).catch(() => setResults([]))
    }, 350)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query])

  return (
    <div className="relative">
      <input
        className="w-full rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        placeholder={current.name}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-[var(--bg)] shadow-lg">
          {results.map((r) => (
            <li key={`${r.name}-${r.latitude}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r)
                  setQuery('')
                  setResults([])
                  setOpen(false)
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface-strong"
              >
                {r.name} <span className="text-muted">· {r.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
