interface ProgressRingProps {
  progress: number // 0..1
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}

export function ProgressRing({ progress, size = 128, strokeWidth = 10, label, sublabel }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, progress))
  const offset = circumference * (1 - clamped)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-strong)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="text-xl font-bold text-ink">{label}</span>}
        {sublabel && <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted">{sublabel}</span>}
      </div>
    </div>
  )
}
