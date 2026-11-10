import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, MapPin } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { useWeather, useWeatherLocation } from '../../lib/useWeather'
import { describeWeatherCode } from '../../lib/weather'

const ICONS = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  'cloud-fog': CloudFog,
}

const DOW_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function WeatherWidget() {
  const { location } = useWeatherLocation()
  const { weather, loading, error } = useWeather(location)

  return (
    <GlassCard>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <MapPin size={13} /> {location.name}
      </div>

      {loading && <p className="mt-4 text-sm text-muted">Lädt …</p>}
      {error && <p className="mt-4 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

      {weather && (
        <>
          <div className="mt-2 flex items-center gap-3">
            {(() => {
              const { icon, label } = describeWeatherCode(weather.current.weatherCode)
              const Icon = ICONS[icon]
              return (
                <>
                  <Icon size={40} style={{ color: 'var(--accent-2)' }} strokeWidth={1.5} />
                  <div>
                    <div className="text-3xl font-bold text-ink">{weather.current.temperature}°</div>
                    <div className="text-xs text-muted">{label}</div>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="mt-4 flex justify-between border-t border-border pt-3">
            {weather.daily.slice(1, 4).map((d) => {
              const { icon } = describeWeatherCode(d.weatherCode)
              const Icon = ICONS[icon]
              const dow = DOW_SHORT[new Date(d.date).getDay()]
              return (
                <div key={d.date} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[10px] font-medium text-muted">{dow}</span>
                  <Icon size={18} style={{ color: 'var(--muted)' }} strokeWidth={1.5} />
                  <span className="text-xs text-ink">{d.tMax}°</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </GlassCard>
  )
}
