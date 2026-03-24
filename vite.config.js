import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist', // carpeta de salida
    sourcemap: true // útil para depurar errores en producción
  }
})
