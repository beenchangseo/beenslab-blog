import {existsSync} from 'node:fs';
import {defineConfig, devices} from '@playwright/test';

// tests/support/session.ts signs admin cookies with JWT_SECRET from .env.
if (existsSync('.env')) {
    process.loadEnvFile('.env');
}

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'html' : 'list',
    use: {
        baseURL: 'http://localhost:7777',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:7777',
        reuseExistingServer: true,
        timeout: 120000,
    },
});
