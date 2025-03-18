const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'chrome-extension://[extension-id]/',
    actionTimeout: 0,
    trace: 'on-first-retry',
    launchOptions: {
      args: [
        `--disable-extensions-except=${path.join(__dirname)}`,
        `--load-extension=${path.join(__dirname)}`
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    }
  ]
}); 