import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:3010', trace: 'on-first-retry' },
  webServer: { command: 'npm run start -- -p 3010', url: 'http://localhost:3010', reuseExistingServer: false },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
