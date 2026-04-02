import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test",
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
