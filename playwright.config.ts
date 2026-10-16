import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
/** Servidor de dev, só para a vitrine de componentes (que não existe no build de produção). */
const PORTA_DEV = 5174

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /componentes\.spec/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testIgnore: /componentes\.spec/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
    {
      name: 'componentes',
      testMatch: /componentes\.spec/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, baseURL: `http://localhost:${PORTA_DEV}` },
    },
  ],
  webServer: [
    {
      command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm dev --port ${PORTA_DEV} --strictPort`,
      port: PORTA_DEV,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
