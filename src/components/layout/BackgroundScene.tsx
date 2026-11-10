// Fixed decorative backdrop: soft accent glow + mountain silhouette, like the
// reference. Pure CSS/SVG, no images, so it adapts instantly to live theme
// colour changes from Einstellungen.
export function BackgroundScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />
      <div
        className="absolute left-1/2 top-[-10%] h-[70vh] w-[90vw] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[45vh] w-[70vw] -translate-x-1/2 rounded-full opacity-50 blur-[100px]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent-2) 60%, transparent) 0%, transparent 70%)',
        }}
      />
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: '28vh', opacity: 'var(--mountain-opacity, 0.5)' }}
      >
        <path
          d="M0 320 L0 210 L160 110 L300 190 L420 70 L560 170 L720 40 L900 160 L1040 90 L1200 200 L1320 130 L1440 220 L1440 320 Z"
          fill="color-mix(in srgb, var(--bg) 70%, black)"
        />
        <path
          d="M0 320 L0 260 L220 170 L380 240 L540 150 L700 230 L880 140 L1060 220 L1220 160 L1440 250 L1440 320 Z"
          fill="color-mix(in srgb, var(--bg) 40%, black)"
        />
      </svg>
    </div>
  )
}
