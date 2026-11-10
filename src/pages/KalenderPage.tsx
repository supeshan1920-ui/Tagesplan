import { CalendarDays } from 'lucide-react'
import { PagePlaceholder } from '../components/ui/GlassCard'

export function KalenderPage() {
  return (
    <PagePlaceholder
      icon={<CalendarDays size={26} />}
      title="Kalender"
      description="Monatsansicht mit Schule/Arbeit/Frei/Teams und .ics-Import folgt in der nächsten Phase."
    />
  )
}
