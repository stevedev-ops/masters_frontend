import crypto from 'node:crypto'
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto
}
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-512.jpg', 'vite.svg'],
      manifest: {
        name: 'The Masters Barber & Executive Spa',
        short_name: 'The Masters',
        description: 'Luxury Barbering & Executive Spa Management System. Record transactions, manage staff, track tips & expenses — works offline.',
        theme_color: '#090d14',
        background_color: '#090d14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache all static assets (JS, CSS, HTML, fonts, images)
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2,woff}'],
        
        // Runtime caching for API calls and Google Fonts
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            // Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // API calls - Network First with offline fallback to cache
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 5
            }
          }
        ]
      }
    })
  ],
})
