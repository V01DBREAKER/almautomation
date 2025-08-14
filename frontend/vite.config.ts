import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    port: 5222,
    proxy: {
      '/api': {
        target: 'https://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../secrets/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "../secrets/server.cert")),
    }
  },
  envDir: "../secrets",
  base:"./",
  // shadcn
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})