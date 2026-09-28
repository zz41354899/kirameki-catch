// Retained only as a record of the pre-Nuxt Vite setup. Nuxt owns the active
// Vite configuration in nuxt.config.ts.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({ plugins: [vue(), tailwindcss()], base: './' })
