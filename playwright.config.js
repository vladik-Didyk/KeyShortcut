import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  webServer: {
    command: 'pnpm preview',
    port: 3000,
    reuseExistingServer: true,
    timeout: 10_000,
  },
})
