import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { useNotes } from '../lib/useNotes'

function NoteRow({ text, onChange, onRemove }: { text: string; onChange: (v: string) => void; onRemove: () => void }) {
  return (
    <li className="group flex items-start gap-2 rounded-lg border border-border bg-surface-strong px-3 py-2">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--accent-2)' }} />
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(1, Math.ceil(text.length / 48))}
        className="min-w-0 flex-1 resize-none bg-transparent text-sm text-ink outline-none"
      />
      <button
        type="button"
        aria-label="Löschen"
        onClick={onRemove}
        className="shrink-0 text-muted opacity-0 transition-opacity hover:text-[var(--danger)] group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </li>
  )
}

export function NotizenPage() {
  const { notes, add, update, remove } = useNotes()
  const [draft, setDraft] = useState('')

  const submit = () => {
    if (!draft.trim()) return
    add(draft.trim())
    setDraft('')
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="text-2xl font-semibold text-ink">Notizen</h1>

      <GlassCard>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Schnelle Notiz …"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-strong px-3 py-2.5 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
          <button
            type="button"
            aria-label="Hinzufügen"
            onClick={submit}
            className="shrink-0 rounded-lg px-3 text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            <Plus size={18} />
          </button>
        </div>
      </GlassCard>

      {notes.length === 0 ? (
        <p className="text-sm text-muted">Noch keine Notizen.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((n) => (
            <NoteRow key={n.id} text={n.text} onChange={(v) => update(n.id, v)} onRemove={() => remove(n.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}
