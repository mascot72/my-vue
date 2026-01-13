import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import type { Plugin } from 'vite'

// Mock data
const timelineMockData = [
  {
    id: 1,
    content: 'Task A',
    start: '2024-01-01',
  },
  {
    id: 2,
    content: 'Task B',
    start: '2024-01-03',
    end: '2024-01-05',
  },
]

// Simple mock plugin
const mockPlugin = (): Plugin => ({
  name: 'mock-server',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/timeline' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(timelineMockData))
        return
      }
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    mockPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
