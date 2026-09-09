import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://orcinusht.github.io/Rumbo/ (a GitHub Pages project
  // site), so every asset URL needs the repo name as its base path.
  base: '/Rumbo/',
})
