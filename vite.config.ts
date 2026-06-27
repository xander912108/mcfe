import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/mcfe/' : './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('/node_modules/react') || id.includes('/node_modules/scheduler')) {
            return 'react-vendor';
          }

          if (id.includes('/node_modules/@radix-ui')) {
            return 'radix-ui';
          }

          if (id.includes('/node_modules/recharts') || id.includes('/node_modules/d3-')) {
            return 'charts';
          }

          if (id.includes('/node_modules/lucide-react')) {
            return 'icons';
          }

          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
