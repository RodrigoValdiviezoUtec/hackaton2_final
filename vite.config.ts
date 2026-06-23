import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Lee variables del .env (incluidas las sin prefijo VITE_).
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.API_PROXY_TARGET // origen del backend, p.ej. https://...run.app

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Escuchar en IPv4 (127.0.0.1). Por defecto Vite ataba solo IPv6 ([::1]) en
      // este sistema y el navegador resolvia localhost a IPv4 -> "no conecta".
      host: '127.0.0.1',
      // El backend solo permite localhost:5173 en su allowlist CORS.
      // strictPort evita que derive a 5174/5175 (que el backend bloquearia).
      port: 5173,
      strictPort: true,
      // Proxy mismo-origen: la app llama /api/... y Vite lo reenvia al backend
      // server-side, eliminando el CORS del navegador (incluido el PATCH).
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
          }
        : undefined,
    },
  }
})
