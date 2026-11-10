import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Music, Upload } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'

interface Track {
  name: string
  url: string
}

export function PlaylistWidget() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => tracks.forEach((t) => URL.revokeObjectURL(t.url))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFiles = (files: FileList) => {
    const next = Array.from(files).map((f) => ({ name: f.name.replace(/\.[^.]+$/, ''), url: URL.createObjectURL(f) }))
    setTracks((t) => [...t, ...next])
  }

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
    setPlaying(!playing)
  }

  const skip = (dir: 1 | -1) => {
    if (tracks.length === 0) return
    setCurrent((c) => (c + dir + tracks.length) % tracks.length)
    setPlaying(true)
  }

  useEffect(() => {
    if (playing) audioRef.current?.play()
  }, [current, playing])

  const track = tracks[current]

  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <Music size={14} /> Lern-Playlist
        </div>
        <button type="button" aria-label="Dateien hinzufügen" onClick={() => fileRef.current?.click()} className="text-muted hover:text-ink">
          <Upload size={15} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {tracks.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Lokale Audiodateien hinzufügen, um loszulegen.</p>
      ) : (
        <>
          <div className="mt-3">
            <p className="truncate text-sm font-medium text-ink">{track.name}</p>
            <p className="text-xs text-muted">{current + 1} / {tracks.length}</p>
          </div>
          <audio
            ref={audioRef}
            src={track.url}
            onEnded={() => skip(1)}
            className="hidden"
          />
          <div className="mt-3 flex items-center justify-center gap-3">
            <button type="button" aria-label="Zurück" onClick={() => skip(-1)} className="text-muted hover:text-ink">
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              aria-label={playing ? 'Pausieren' : 'Abspielen'}
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-full text-accent-ink"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button type="button" aria-label="Weiter" onClick={() => skip(1)} className="text-muted hover:text-ink">
              <SkipForward size={18} />
            </button>
          </div>
        </>
      )}
    </GlassCard>
  )
}
