import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export function GlassCard({ children, className = '', title, action }: GlassCardProps) {
  return (
    <div className={`glass p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-[15px] font-semibold text-ink">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function PagePlaceholder({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-accent-ink"
        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
      >
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
    </div>
  )
}
