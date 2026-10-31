import {expect, test} from '@playwright/test';
import {adminSessionCookie} from './support/session';

test.beforeEach(async ({context}) => {
    await context.clearCookies();
});

test('admin pages redirect to sign-in without a session', async ({page}) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin/signin');

    await page.goto('/admin/board/editor');
    await expect(page).toHaveURL('/admin/signin');
});

test('wrong credentials show an error', async ({page}) => {
    await page.goto('/admin/signin');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible();
});

test('a session opens the admin list, survives navigation, and logs out', async ({
    page,
    context,
    baseURL,
}) => {
    await context.addCookies([{...(await adminSessionCookie()), url: baseURL!}]);

    await page.goto('/admin');
    await expect(page).toHaveURL('/admin/blog');
    await expect(page.getByRole('heading', {name: '블로그 관리'})).toBeVisible();

    await page.goto('/blog');
    const logout = page.getByRole('button', {name: 'Logout'});
    await expect(logout).toBeVisible();
    await logout.click();
    await expect(page).toHaveURL('/');

    await page.goto('/admin/blog');
    await expect(page).toHaveURL('/admin/signin');
});

test('signing in with the real account lands on the admin list', async ({page}) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, 'set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run');

    await page.goto('/admin/signin');
    await page.fill('input[name="email"]', email!);
    await page.fill('input[name="password"]', password!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin/blog');
});
