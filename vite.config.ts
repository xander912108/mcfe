import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

process.env.BROWSERSLIST_IGNORE_OLD_DATA ??= '1'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/mcfe/' : './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/LeaderConsoleEntry.tsx')) return 'leader-entry'
          if (id.includes('src/LeaderConsoleMain.tsx')) return 'leader-main'
          if (id.includes('src/LeaderConsoleRequests.tsx')) return 'leader-requests'
          if (id.includes('src/LeaderConsoleConnections.tsx')) return 'leader-connections'
          if (id.includes('src/LeaderConsoleContribution.tsx')) return 'leader-contribution'
          if (id.includes('src/LeaderConsoleMonetization.tsx')) return 'leader-monetization'
          if (id.includes('src/LeaderConsoleSettings.tsx')) return 'leader-settings'
          if (id.includes('src/pages/MyConnections.tsx')) return 'my-connections'
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react') || id.includes('/react-dom') || id.includes('/scheduler')) return 'vendor-react'
          if (id.includes('@radix-ui')) return 'vendor-radix'
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          return 'vendor'
        },
      },
    },
  },
});
