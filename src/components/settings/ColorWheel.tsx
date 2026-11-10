import { useEffect, useRef, useState } from 'react'
import { hsvToRgb, rgbToHex, rgbToHsv, hexToRgb, type HSV } from '../../lib/color'

const SIZE = 200
const RADIUS = SIZE / 2

function drawWheel(ctx: CanvasRenderingContext2D, value: number) {
  const img = ctx.createImageData(SIZE, SIZE)
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - RADIUS
      const dy = y - RADIUS
      const dist = Math.sqrt(dx * dx + dy * dy)
      const idx = (y * SIZE + x) * 4
      if (dist > RADIUS) {
        img.data[idx + 3] = 0
        continue
      }
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI
      if (angle < 0) angle += 360
      const s = Math.min(1, dist / RADIUS)
      const { r, g, b } = hsvToRgb({ h: angle, s, v: value })
      img.data[idx] = r
      img.data[idx + 1] = g
      img.data[idx + 2] = b
      img.data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

export function ColorWheel({ hex, onChange }: { hex: string; onChange: (hex: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(hexToRgb(hex) ?? { r: 139, g: 92, b: 246 }))
  const dragging = useRef(false)

  // keep internal hsv in sync if the hex changes from outside (e.g. preset click)
  useEffect(() => {
    const rgb = hexToRgb(hex)
    if (rgb) setHsv(rgbToHsv(rgb))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) drawWheel(ctx, hsv.v)
  }, [hsv.v])

  const applyFromPointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * SIZE
    const y = ((clientY - rect.top) / rect.height) * SIZE
    const dx = x - RADIUS
    const dy = y - RADIUS
    const dist = Math.min(RADIUS, Math.sqrt(dx * dx + dy * dy))
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI
    if (angle < 0) angle += 360
    const s = dist / RADIUS
    const next = { ...hsv, h: angle, s }
    setHsv(next)
    onChange(rgbToHex(hsvToRgb(next)))
  }

  const knobX = RADIUS + Math.cos((hsv.h * Math.PI) / 180) * hsv.s * RADIUS
  const knobY = RADIUS + Math.sin((hsv.h * Math.PI) / 180) * hsv.s * RADIUS

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="cursor-crosshair touch-none rounded-full"
          style={{ boxShadow: '0 0 0 1px var(--border)' }}
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            applyFromPointer(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => {
            if (dragging.current) applyFromPointer(e.clientX, e.clientY)
          }}
          onPointerUp={() => {
            dragging.current = false
          }}
        />
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: knobX, top: knobY, background: hex }}
          aria-hidden="true"
        />
      </div>

      <div className="flex w-full items-center gap-2">
        <span className="text-xs text-muted">Helligkeit</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={hsv.v}
          onChange={(e) => {
            const next = { ...hsv, v: Number(e.target.value) }
            setHsv(next)
            onChange(rgbToHex(hsvToRgb(next)))
          }}
          className="flex-1 accent-[var(--accent)]"
        />
      </div>
    </div>
  )
}
