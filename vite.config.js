import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), viteSingleFile()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mymurti-server-88q9.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
