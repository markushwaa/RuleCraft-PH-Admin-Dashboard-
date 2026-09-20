import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: false,
    rolldownOptions: {
      output: {
        minify: mode === 'production'
          ? { compress: { dropConsole: true, dropDebugger: true }, mangle: true }
          : false,
      },
    },
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    },
  },
}))
