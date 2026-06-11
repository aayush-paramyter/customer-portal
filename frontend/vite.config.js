import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8011',
        changeOrigin: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const portalHost = req.headers['x-portal-host']
            const portalOrigin = req.headers['x-portal-origin']
            if (portalHost) proxyReq.setHeader('X-Portal-Host', portalHost)
            if (portalOrigin) proxyReq.setHeader('X-Portal-Origin', portalOrigin)
          })
        },
      },
      '/health': {
        target: 'http://127.0.0.1:8011',
        changeOrigin: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
  },
})
