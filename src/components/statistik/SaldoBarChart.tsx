interface SaldoPoint {
  date: string // YYYY-MM-DD
  saldoHeute: number
}

const DOW_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function SaldoBarChart({ points }: { points: SaldoPoint[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-muted">Noch keine gespeicherten Tage — "Tag speichern" im Zeitrechner.</p>
  }

  const w = 340
  const h = 140
  const padX = 8
  const padY = 16
  const maxAbs = Math.max(10, ...points.map((p) => Math.abs(p.saldoHeute)))
  const baselineY = padY + (h - padY * 2) / 2
  const barW = (w - padX * 2) / points.length - 8

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 'auto' }}>
      <line x1={padX} x2={w - padX} y1={baselineY} y2={baselineY} stroke="var(--border)" strokeWidth={1} />
      {points.map((p, i) => {
        const x = padX + i * ((w - padX * 2) / points.length) + 4
        const scale = (h / 2 - padY) / maxAbs
        const barH = Math.abs(p.saldoHeute) * scale
        const y = p.saldoHeute >= 0 ? baselineY - barH : baselineY
        const color = p.saldoHeute > 0 ? 'var(--good)' : p.saldoHeute < 0 ? 'var(--danger)' : 'var(--muted)'
        const dow = DOW_SHORT[new Date(p.date + 'T00:00:00').getDay()]
        return (
          <g key={p.date}>
            <rect x={x} y={y} width={barW} height={Math.max(2, barH)} rx={3} fill={color} />
            <text x={x + barW / 2} y={h - 2} textAnchor="middle" fontSize="9" fill="var(--muted)">
              {dow}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
