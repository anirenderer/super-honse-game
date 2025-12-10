import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite base should match your GitHub Pages repo path.
// This makes built assets use absolute paths like /super-honse-game/
export default defineConfig({
  base: '/super-honse-game/',
  plugins: [vue()]
})
