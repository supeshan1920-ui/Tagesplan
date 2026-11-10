import { useEffect, useState } from 'react'

const KEY = 'tagesplan.profile.v1'

interface Profile {
  name: string
}

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { name: 'du', ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { name: 'Supeshan' }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(profile))
  }, [profile])

  return {
    profile,
    setName: (name: string) => setProfile((p) => ({ ...p, name: name || 'du' })),
  }
}
