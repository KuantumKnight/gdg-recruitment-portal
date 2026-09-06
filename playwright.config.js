import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const launchOptions = executablePath ? { executablePath } : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:3101", trace: "off", screenshot: "only-on-failure", launchOptions },
  webServer: { command: "bun run dev -- --port 3101", url: "http://127.0.0.1:3101", reuseExistingServer: !process.env.CI, timeout: 120000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
});