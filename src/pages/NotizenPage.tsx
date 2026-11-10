import { StickyNote } from 'lucide-react'
import { PagePlaceholder } from '../components/ui/GlassCard'

export function NotizenPage() {
  return (
    <PagePlaceholder
      icon={<StickyNote size={26} />}
      title="Notizen"
      description="Schnelle Stichpunkte mit Inline-Bearbeitung folgen in der nächsten Phase."
    />
  )
}
