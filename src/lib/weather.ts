export interface GeoResult {
  name: string
  country: string
  latitude: number
  longitude: number
}

export interface WeatherNow {
  temperature: number
  weatherCode: number
}

export interface WeatherDay {
  date: string
  tMax: number
  tMin: number
  weatherCode: number
}

export interface WeatherData {
  current: WeatherNow
  daily: WeatherDay[]
}

export async function geocodeCity(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return []
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=de`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding fehlgeschlagen')
  const data = await res.json()
  return (data.results ?? []).map((r: { name: string; country: string; latitude: number; longitude: number }) => ({
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }))
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=4`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Wetterdaten nicht verfügbar')
  const data = await res.json()
  return {
    current: { temperature: Math.round(data.current.temperature_2m), weatherCode: data.current.weather_code },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      tMax: Math.round(data.daily.temperature_2m_max[i]),
      tMin: Math.round(data.daily.temperature_2m_min[i]),
      weatherCode: data.daily.weather_code[i],
    })),
  }
}

// WMO weather codes -> short German label + a lucide icon name
export function describeWeatherCode(code: number): { label: string; icon: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning' | 'cloud-fog' } {
  if (code === 0) return { label: 'Klar', icon: 'sun' }
  if ([1, 2].includes(code)) return { label: 'Leicht bewölkt', icon: 'cloud-sun' }
  if (code === 3) return { label: 'Bewölkt', icon: 'cloud' }
  if ([45, 48].includes(code)) return { label: 'Nebel', icon: 'cloud-fog' }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Regen', icon: 'cloud-rain' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Schnee', icon: 'cloud-snow' }
  if ([95, 96, 99].includes(code)) return { label: 'Gewitter', icon: 'cloud-lightning' }
  return { label: 'Bewölkt', icon: 'cloud' }
}
