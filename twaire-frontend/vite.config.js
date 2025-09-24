import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // I enabled the following settings just so I can use this with ngrok and port forwarding. Absolutely do not enable this in production!!!
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/data': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  }
})
