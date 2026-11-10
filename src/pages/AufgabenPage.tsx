import { ListChecks } from 'lucide-react'
import { PagePlaceholder } from '../components/ui/GlassCard'

export function AufgabenPage() {
  return (
    <PagePlaceholder
      icon={<ListChecks size={26} />}
      title="Aufgaben"
      description="Alle/Heute/Bald/Erledigt mit Fälligkeit, Priorität und Stern folgt in der nächsten Phase."
    />
  )
}
