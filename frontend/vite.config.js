import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxies API calls to the Express/Node backend during development.
      // Point this at your MERN backend server.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
