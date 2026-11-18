import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// Relative base instead of a hardcoded GitHub Pages subpath: combined with
// HashRouter (see App.tsx), this makes the exact same dist/ build work when
// opened directly as a local file (double-click dist/index.html — no server
// needed at all), hosted at a domain root, or hosted under any subpath —
// without needing to know in advance which one it'll be.
const BASE = './'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tagesplan',
        short_name: 'Tagesplan',
        description: 'Persönliches Dashboard, Kalender und Zeitrechner',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#0a0b16',
        theme_color: '#0a0b16',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // app-shell + static assets cached on install; API calls (Open-Meteo,
        // eventually Supabase) are left to the network — caching those would
        // mean showing stale weather/data instead of a clear "offline" state.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
