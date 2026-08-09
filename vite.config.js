import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// TOLS Professional Full-Stack — no Base44 dependency, pure Vite + API proxy
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react','react-dom','react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog','@radix-ui/react-dropdown-menu','framer-motion'],
          charts: ['recharts'],
        }
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: { clientPort: 443 },
    cors: true,
    allowedHosts: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
    },
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  }
});
