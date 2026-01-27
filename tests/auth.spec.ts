import {test, expect} from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({context}) => {
        await context.clearCookies();
    });

    test('should redirect to login when accessing /admin without auth', async ({page}) => {
        await page.goto('/admin');
        await expect(page).toHaveURL('/admin/signin');
    });

    test('complete auth flow: login -> access admin -> logout', async ({page}) => {
        await page.goto('/admin');
        await expect(page).toHaveURL('/admin/signin');

        console.log('Step 1: On login page');

        await page.fill('input[name="email"]', 'beenslab.corp@gmail.com');
        await page.fill('input[name="password"]', 'test1234');

        console.log('Step 2: Filled login form');

        await page.click('button[type="submit"]');

        console.log('Step 3: Clicked submit');

        await page.waitForURL('/admin', {timeout: 10000});

        console.log('Step 4: Redirected to /admin');

        await expect(page).toHaveURL('/admin');

        const adminTitle = page.locator('h1:has-text("블로그 관리자 대시보드")');
        await expect(adminTitle).toBeVisible();

        console.log('Step 5: Admin dashboard visible');

        const logoutButton = page.locator('button:has-text("Logout")');
        await expect(logoutButton).toBeVisible({timeout: 5000});

        console.log('Step 6: Logout button visible');

        await logoutButton.click();

        console.log('Step 7: Clicked logout');

        await page.waitForURL('/', {timeout: 10000});

        console.log('Step 8: Redirected to home');

        await expect(page).toHaveURL('/');

        await page.goto('/admin');
        await expect(page).toHaveURL('/admin/signin');

        console.log('Step 9: Verified redirect to login after logout');
    });

    test('should show error with invalid credentials', async ({page}) => {
        await page.goto('/admin/signin');

        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');

        await page.click('button[type="submit"]');

        await page.waitForTimeout(1000);

        const errorMessage = page.locator('text=/이메일 또는 비밀번호/');
        await expect(errorMessage).toBeVisible({timeout: 5000});

        console.log('Verified error message for invalid credentials');
    });

    test('should maintain session across page navigations', async ({page}) => {
        await page.goto('/admin/signin');

        await page.fill('input[name="email"]', 'beenslab.corp@gmail.com');
        await page.fill('input[name="password"]', 'test1234');
        await page.click('button[type="submit"]');

        await page.waitForURL('/admin');

        await page.goto('/');
        await expect(page).toHaveURL('/');

        const logoutButton = page.locator('button:has-text("Logout")');
        await expect(logoutButton).toBeVisible();

        console.log('Session maintained after navigation to home');

        await page.goto('/admin');
        await expect(page).toHaveURL('/admin');

        const adminTitle = page.locator('h1:has-text("블로그 관리자 대시보드")');
        await expect(adminTitle).toBeVisible();

        console.log('Session maintained after navigation back to admin');
    });
});
