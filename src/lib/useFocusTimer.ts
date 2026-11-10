import { useEffect, useRef, useState } from 'react'

const DURATION_KEY = 'tagesplan.focusDurationMin.v1'
const DEFAULT_DURATION_MIN = 25

export function useFocusDuration() {
  const [durationMin, setDurationMinState] = useState<number>(() => {
    const raw = localStorage.getItem(DURATION_KEY)
    return raw ? Number(raw) : DEFAULT_DURATION_MIN
  })
  const setDurationMin = (min: number) => {
    localStorage.setItem(DURATION_KEY, String(min))
    setDurationMinState(min)
  }
  return { durationMin, setDurationMin }
}

export function useFocusTimer(durationMin: number) {
  const [remainingSec, setRemainingSec] = useState(durationMin * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // reset the countdown whenever the configured duration changes (and we're not mid-session)
  useEffect(() => {
    if (!running) setRemainingSec(durationMin * 60)
  }, [durationMin, running])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemainingSec((s) => {
        if (s <= 1) {
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  return {
    remainingSec,
    running,
    progress: 1 - remainingSec / (durationMin * 60),
    start: () => {
      if (remainingSec === 0) setRemainingSec(durationMin * 60)
      setRunning(true)
    },
    pause: () => setRunning(false),
    reset: () => {
      setRunning(false)
      setRemainingSec(durationMin * 60)
    },
  }
}
