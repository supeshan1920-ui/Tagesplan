import { useEffect, useState } from 'react'
import { fetchWeather, type GeoResult, type WeatherData } from './weather'

const LOCATION_KEY = 'tagesplan.weatherLocation.v1'
const DEFAULT_LOCATION: GeoResult = { name: 'Dietikon', country: 'Schweiz', latitude: 47.4009, longitude: 8.4007 }
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 min

function loadLocation(): GeoResult {
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCATION
}

export function useWeatherLocation() {
  const [location, setLocationState] = useState<GeoResult>(loadLocation)
  const setLocation = (loc: GeoResult) => {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc))
    setLocationState(loc)
  }
  return { location, setLocation }
}

interface CachedWeather {
  data: WeatherData
  fetchedAt: number
  key: string
}

export function useWeather(location: GeoResult) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const key = `${location.latitude},${location.longitude}`
    const cacheKey = 'tagesplan.weatherCache.v1'

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const cachedRaw = localStorage.getItem(cacheKey)
        if (cachedRaw) {
          const cached: CachedWeather = JSON.parse(cachedRaw)
          if (cached.key === key && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            if (!cancelled) {
              setWeather(cached.data)
              setLoading(false)
            }
            return
          }
        }
        const data = await fetchWeather(location.latitude, location.longitude)
        if (cancelled) return
        setWeather(data)
        localStorage.setItem(cacheKey, JSON.stringify({ data, fetchedAt: Date.now(), key } satisfies CachedWeather))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Fehler beim Laden')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [location.latitude, location.longitude])

  return { weather, error, loading }
}
