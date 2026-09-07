import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],

  base: command === 'build' ? '/AyushCare/' : '/',

  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
}))