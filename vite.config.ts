import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { agentPages, pageEntries } from './src/agent/pages.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), agentPages()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pageEntries.map(entry => [entry.pageId, entry.input])),
    },
  },
})
