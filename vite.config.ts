import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // El backend solo permite localhost:5173 en su allowlist CORS.
    // strictPort evita que derive a 5174/5175 (que el backend bloquearia).
    port: 5173,
    strictPort: true,
  },
})
