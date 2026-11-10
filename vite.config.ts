import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tagesplan',
        short_name: 'Tagesplan',
        description: 'Persönliches Dashboard, Kalender und Zeitrechner',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0b16',
        theme_color: '#0a0b16',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
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
