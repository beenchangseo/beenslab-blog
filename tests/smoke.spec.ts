import {expect, test} from '@playwright/test';
import {adminSessionCookie} from './support/session';

// Fetched without a browser: a browser on a post page loads the view-counter image,
// which adds a view to the production Redis count.
const PUBLIC_PAGES = [
    {path: '/', contains: '최신 글'},
    {path: '/blog', contains: '<h1'},
    {path: '/blog/page/2', contains: '2페이지'},
    {path: '/category', contains: '카테고리'},
    {path: '/category/backend', contains: 'Backend'},
    {path: '/search?q=redis', contains: '검색'},
    {path: '/career', contains: '이력서 - 서창빈'},
    {path: '/rss.xml', contains: '<rss'},
    {path: '/sitemap.xml', contains: '<urlset'},
    {path: '/robots.txt', contains: 'sitemap.xml'},
];

for (const {path, contains} of PUBLIC_PAGES) {
    test(`${path} renders`, async ({request}) => {
        const response = await request.get(path);
        expect(response.status()).toBe(200);
        expect(await response.text()).toContain(contains);
    });
}

test('every post in the sitemap renders with its canonical URL', async ({request}) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const postPaths = [...sitemap.matchAll(/<loc>[^<]+?(\/blog\/post\/[^<]+)<\/loc>/g)].map(
        (match) => match[1],
    );
    expect(postPaths.length).toBeGreaterThan(0);

    for (const postPath of postPaths) {
        const response = await request.get(postPath);
        expect(response.status(), postPath).toBe(200);
        expect(await response.text()).toContain(
            `<link rel="canonical" href="https://blog.beenslab.com${postPath}"/>`,
        );
    }
});

test('unknown post and page numbers are 404', async ({request}) => {
    expect((await request.get('/blog/post/no-such-post')).status()).toBe(404);
    expect((await request.get('/blog/page/1')).status()).toBe(404);
    expect((await request.get('/blog/page/999')).status()).toBe(404);
});

test('legacy category links redirect to the category path', async ({request}) => {
    const response = await request.get('/category?filter=backend', {maxRedirects: 0});
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(/^\/category\/backend/);
});

test('the editor opens an existing post and rejects an unknown slug', async ({
    page,
    context,
    baseURL,
    request,
}) => {
    await context.addCookies([{...(await adminSessionCookie()), url: baseURL!}]);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const slug = /\/blog\/post\/([^<]+)<\/loc>/.exec(sitemap)![1];

    await page.goto(`/admin/board/editor/${slug}`);
    await expect(page.getByRole('heading', {name: '게시글 수정'})).toBeVisible();
    await expect(page.getByLabel('제목 *')).not.toHaveValue('');

    await page.goto('/admin/board/editor/no-such-post');
    await expect(page.getByText('페이지를 찾을 수 없습니다')).toBeVisible();
});
