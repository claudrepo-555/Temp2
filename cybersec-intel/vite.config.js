import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/nvd': {
        target: 'https://services.nvd.nist.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvd/, ''),
      },
      '/api/cisa': {
        target: 'https://www.cisa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cisa/, ''),
      },
    },
  },
})
