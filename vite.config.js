import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
     base: isVercel
    ? '/' // Vercel
    : '/DataNews-ProyectoFinal_2025IIg1_Munoz_Santiago_Velasquez_Alejandro/', // GitHub Pages
})
