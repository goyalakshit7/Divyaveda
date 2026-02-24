import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '/admin' when building for production, '/' for local dev
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/admin' : '/',
}))

