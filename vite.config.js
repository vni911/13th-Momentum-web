import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // port 번호 고정 
    open: true, // 자동으로 브라우저 열기
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
})