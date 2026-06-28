import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Proxy API calls to Flask backend during development.
  // When the frontend calls /api/..., Vite forwards it to Flask on port 5000.
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
