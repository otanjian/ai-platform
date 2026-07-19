/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'node',
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      host: "localhost",
      port: 3000,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/login": "http://localhost:3001",
      "/logout": "http://localhost:3001",
      "/auth": "http://localhost:3001",
    },
  },
})
