import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 用 Viteプラグイン
  ],
  base: '/jlpt/', // ← リポジトリ名に合わせる（例: /my-repo/）
})
