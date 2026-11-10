# Tagesplan

Persönliches Dashboard, Kalender und Zeitrechner. React + Vite + TypeScript,
Tailwind CSS, Supabase (Auth + Postgres).

## Status

This is being built in phases (see the build order below). Currently done
and verified in a real browser, both themes, desktop + 390px mobile:

- [x] Project setup, routing, icon-only sidebar, dark/light theme tokens
- [x] Zeitrechner — ported from `arbeitszeit_3.html`, verified with Vitest
      against the exact given test cases, same results in the live UI
- [x] Basic colour controls + light/dark toggle in Einstellungen
- [x] Supabase schema (`supabase/schema.sql`) — ready to run, not yet wired
      to a live project
- [ ] Full colour wheel (canvas-based) in Einstellungen
- [ ] Auth wired to a real Supabase project
- [ ] Kalender (month grid, entries, .ics/JSON import)
- [ ] Dashboard widgets (Heute, Wetter, Aufgaben, Fokus-Timer, Gewohnheiten, …)
- [ ] Aufgaben, Notizen, Statistik
- [ ] Pause-Countdown + progress ring on Zeitrechner
- [ ] PWA (installable, offline cache)
- [ ] Deploy

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # Vitest
npm run build    # type-check + production build
```

## Supabase setup (once you have a project)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. In the SQL editor, run `supabase/schema.sql` once.
3. In **Authentication → Providers**, make sure Email is enabled.
4. In **Project Settings → API**, copy the Project URL and the `anon` public key.
5. Copy `.env.example` to `.env.local` and fill in those two values:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
6. Restart `npm run dev`. The app detects the env vars automatically — until
   they're set, everything runs fully local (localStorage), so development
   isn't blocked on this.

Never commit `.env.local` — it's already gitignored.

## Deploying (Vercel or Netlify, either works)

**Vercel**
1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo → framework
   preset "Vite" is auto-detected.
3. Add the two `VITE_SUPABASE_*` env vars in the project's Environment
   Variables settings before the first deploy (or redeploy after adding them).

**Netlify**
1. Push this repo to GitHub.
2. [app.netlify.com/start](https://app.netlify.com/start) → pick the repo.
3. Build command `npm run build`, publish directory `dist`.
4. Add the two `VITE_SUPABASE_*` env vars under Site settings → Environment
   variables before the first deploy.

## Project structure

```
src/
  lib/            pure logic (zeitrechner.ts + its Vitest tests, hooks)
  context/        ThemeContext (colours/mode), AuthContext (Supabase session)
  components/
    layout/       Sidebar, AppLayout, BackgroundScene
    ui/           GlassCard, PagePlaceholder
  pages/          one file per sidebar section
supabase/
  schema.sql      run once in the Supabase SQL editor
```
