import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: Number(process.env.CLIENT_PORT) ?? 3000,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.SERVER_PORT}`,
      }
    }
  }
})
