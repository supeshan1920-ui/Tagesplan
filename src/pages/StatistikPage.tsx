import { BarChart3 } from 'lucide-react'
import { PagePlaceholder } from '../components/ui/GlassCard'

export function StatistikPage() {
  return (
    <PagePlaceholder
      icon={<BarChart3 size={26} />}
      title="Statistik"
      description="Fokus-Sessions, erledigte Aufgaben, Gewohnheiten und der Saldo-Verlauf der letzten 7 Tage folgen in der nächsten Phase."
    />
  )
}
