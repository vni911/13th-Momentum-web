import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // port 번호 고정 
    open: true, // 자동으로 브라우저 열기
    proxy: {
      '/api': {
        target: 'http://43.201.75.36:8080',
        changeOrigin: true,
      },
      '/public-data': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/public-data/, '')
      }
    }
  },
})