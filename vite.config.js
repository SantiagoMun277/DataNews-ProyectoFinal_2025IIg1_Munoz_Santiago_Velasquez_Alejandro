// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'


// const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//      base: isVercel
//     ? '/' // Vercel
//     : '/DataNews-ProyectoFinal_2025IIg1_Munoz_Santiago_Velasquez_Alejandro/', // GitHub Pages
// })

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Solo activamos base de GitHub Pages cuando GHPAGES=1
const isGhPages = process.env.GHPAGES === '1'
export default defineConfig({
  plugins: [react()],
  base: isGhPages
    ? '/DataNews-ProyectoFinal_2025IIg1_Munoz_Santiago_Velasquez_Alejandro/'
    : '/', // <- Vercel y dev local
})
