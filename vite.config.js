import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        // LOCAL
        target: 'http://localhost:8000',
        
        // remote
        // target: 'http://135.1.1.XXX:8000',  // 백엔드 PC I
        // target: 'http://192.168.x.x:8000',
        changeOrigin: true,
      },
    },
  },
})
