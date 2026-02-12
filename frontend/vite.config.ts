import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Αποθήκη Αλουμινίου / Σιδήρας',
        short_name: 'Αποθήκη',
        description: 'Διαχείριση αποθήκης αλουμινίου και σιδήρας',
        theme_color: '#1d4ed8',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  server: {
    port: 5174,
    strictPort: true, // Always 5174 so 5173 stays free for another app
    host: true, // Listen on 0.0.0.0 so phone/other devices can open app via LAN IP (e.g. QR code)
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
