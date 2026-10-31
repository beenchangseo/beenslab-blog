// Records what a running build serves, so two builds can be diffed with `diff -r`.
//
//   node --env-file=.env --import tsx tests/support/snapshot.ts http://localhost:7777 <outDir>
//
// The app shares one database with production, so nothing here may write.
// /api/blog/count is never requested because it increments production view counters,
// and every Server Action request is either aborted or rewritten to a post id that
// does not exist.
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {chromium, type BrowserContext, type Page} from 'playwright';
import {adminSessionCookie} from './session';

const [base, outDir] = process.argv.slice(2);
if (!base || !outDir) {
    console.error('usage: snapshot.ts <baseUrl> <outDir>');
    process.exit(1);
}

const PUBLIC_EXTRAS = [
    '/sitemap.xml',
    '/robots.txt',
    '/rss.xml',
    '/opengraph-image',
    '/twitter-image',
    '/icon',
    '/apple-icon',
    '/search?q=redis',
    '/search?q=redis&page=2',
    '/search?q=',
    '/search?q=zzzz-no-hit',
    '/category?filter=backend',
    '/blog/page/1',
    '/blog/page/999',
    '/blog/post/no-such-post',
    '/no-such-page',
    '/api/cron/sync-views',
];

const ADMIN_PATHS = [
    '/admin',
    '/admin/blog',
    '/admin/board/editor',
    '/admin/signin',
    '/api/auth/session',
    '/api/blog/posts',
    '/api/categories',
    '/api/series',
];

const FAKE_POST_ID = '00000000-0000-0000-0000-000000000000';
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

type Variant = 'anon' | 'admin';

function normalizeHtml(html: string): string {
    return html
        .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<link\b[^>]*\/_next\/static\/[^>]*>/g, '')
        .replace(/\/_next\/static\/[^"'\s)]+/g, '/_next/static/*')
        .replace(
            /\b(opengraph-image|twitter-image|icon|apple-icon)(-[a-z0-9]{6})?(\?[0-9a-f]{16})?/g,
            '$1*',
        )
        .replace(/></g, '>\n<');
}

function fileName(variant: Variant, urlPath: string): string {
    const safe = urlPath.replace(/^\//, '').replace(/[^a-zA-Z0-9._-]+/g, '_') || 'index';
    return `${variant}__${safe}.txt`;
}

async function record(urlPath: string, variant: Variant, cookie: string, index: string[]) {
    const response = await fetch(base + urlPath, {
        redirect: 'manual',
        headers: variant === 'admin' ? {cookie} : {},
    });
    const type = response.headers.get('content-type') ?? '';
    const location = response.headers.get('location') ?? '';
    const bytes = new Uint8Array(await response.arrayBuffer());
    const text = new TextDecoder().decode(bytes);

    let body: string;
    if (type.startsWith('image/')) {
        body = `sha256 ${createHash('sha256').update(bytes).digest('hex')} bytes ${bytes.length}\n`;
    } else if (type.includes('text/html')) {
        body = normalizeHtml(text);
    } else {
        body = text;
    }

    writeFileSync(path.join(outDir, fileName(variant, urlPath)), body);
    index.push([variant, urlPath, response.status, location, type.split(';')[0]].join('\t'));
    return text;
}

async function readEditor(page: Page) {
    return page.evaluate(() => {
        const value = (selector: string) =>
            (document.querySelector(selector) as HTMLInputElement | null)?.value ?? null;
        const series = document.querySelector('#series') as HTMLSelectElement | null;
        const main = document.querySelector('main');
        return {
            headings: [...(main?.querySelectorAll('h1, h1 + span') ?? [])].map((el) =>
                el.textContent?.trim(),
            ),
            title: value('input[placeholder="게시글 제목을 입력하세요"]'),
            description: value('input[placeholder="게시글 설명 (SEO용)"]'),
            tags: value('input[placeholder^="쉼표로 구분"]'),
            cover: value('#cover-image'),
            seriesId: series?.value ?? null,
            seriesLabel: series?.selectedOptions[0]?.textContent ?? null,
            seriesOptions: [...(series?.options ?? [])].map((o) => o.textContent),
            seriesOrder: value('#series-order'),
            seriesOrderDisabled: (document.querySelector('#series-order') as HTMLInputElement)
                ?.disabled,
            categories: [...document.querySelectorAll('main input[type=checkbox]')].map((el) => ({
                label: el.closest('label')?.textContent?.trim(),
                checked: (el as HTMLInputElement).checked,
            })),
            contents: value('textarea.w-md-editor-text-input'),
            buttons: [...(main?.querySelectorAll('button') ?? [])]
                .map((el) => el.textContent?.trim())
                .filter((text) => text && !/^[A-Za-z]*$/.test(text)),
            error: main?.querySelector('.bg-red-100')?.textContent?.trim() ?? null,
        };
    });
}

// Clicks a save button and returns the Server Action arguments it would have sent.
// The request is aborted, so the action never runs.
async function interceptSave(page: Page, button: RegExp) {
    let body: string | null = null;
    await page.route('**/*', async (route) => {
        const request = route.request();
        if (request.method() === 'POST' && request.headers()['next-action']) {
            body = request.postData();
            await route.abort();
            return;
        }
        await route.continue();
    });
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', {name: button}).click();
    await page.waitForFunction(() => !document.querySelector('main button[disabled]'));
    await page.waitForTimeout(300);
    await page.unroute('**/*');

    const args = body ? JSON.parse(body) : null;
    const after = await readEditor(page);
    return {args: sortKeys(args), errorAfterAbort: after.error};
}

function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => [k, sortKeys(v)]),
        );
    }
    return value;
}

async function clickSave(page: Page, button: RegExp) {
    await page.getByRole('button', {name: button}).click();
    await page.waitForTimeout(200);
    return (await readEditor(page)).error;
}

async function captureCreateEditor(context: BrowserContext) {
    const page = await context.newPage();
    await page.goto(`${base}/admin/board/editor`);
    await page.locator('main input[type=checkbox]').first().waitFor();

    const initial = await readEditor(page);
    const publish = /^발행$/;
    const validation: (string | null)[] = [await clickSave(page, publish)];
    await page.getByPlaceholder('게시글 제목을 입력하세요').fill('Snapshot 제목');
    validation.push(await clickSave(page, publish));
    await page.getByPlaceholder('게시글 설명 (SEO용)').fill('snapshot description');
    validation.push(await clickSave(page, publish));
    await page.locator('textarea.w-md-editor-text-input').fill('# body\n\ntext');
    validation.push(await clickSave(page, publish));

    await page.locator('main input[type=checkbox]').nth(1).check();
    await page.getByPlaceholder(/^쉼표로 구분/).fill(' a, b ,, c ');
    await page.locator('#cover-image').fill('  /images/x.png  ');
    const seriesValue = await page.locator('#series option').nth(1).getAttribute('value');
    if (seriesValue) await page.locator('#series').selectOption(seriesValue);
    await page.locator('#series-order').fill('2');

    const filled = await readEditor(page);
    const draft = await interceptSave(page, /초안/);
    const published = await interceptSave(page, publish);
    await page.close();
    return {initial, validation, filled, draft, published};
}

async function captureEditEditor(context: BrowserContext, slug: string) {
    const page = await context.newPage();
    await page.goto(`${base}/admin/board/editor/${slug}`);
    await page.waitForFunction(
        () =>
            (
                document.querySelector(
                    'input[placeholder="게시글 제목을 입력하세요"]',
                ) as HTMLInputElement | null
            )?.value,
    );

    const loaded = await readEditor(page);
    const draft = await interceptSave(page, /초안/);
    const published = await interceptSave(page, /^(발행|수정)$/);
    await page.close();
    return {loaded, draft, published};
}

function classifyDeleteAlert(message: string | null): string | null {
    if (message == null) return null;
    if (message.includes('Unauthorized')) return 'unauthorized';
    if (/No record was found|Record to update not found|P2025/.test(message)) {
        return 'record-not-found';
    }
    return `other: ${message.slice(0, 120)}`;
}

// Calls softDeletePost from /admin/blog with and without a session. The post id in
// the request is swapped for one that does not exist, so nothing can be deleted.
// Without a session, proxy redirects the action POST before the action runs.
async function probeDeleteGuard(context: BrowserContext, withSession: boolean) {
    const page = await context.newPage();
    await page.goto(`${base}/admin/blog`);
    if (!withSession) await context.clearCookies();

    let sentBody: string | null = null;
    await page.route('**/*', async (route) => {
        const request = route.request();
        if (request.method() !== 'POST' || !request.headers()['next-action']) {
            await route.continue();
            return;
        }
        const body = request.postData() ?? '';
        if (!/^\["[0-9a-f-]{36}"\]$/.test(body)) {
            sentBody = `aborted unexpected body: ${body.slice(0, 80)}`;
            await route.abort();
            return;
        }
        sentBody = body.replace(UUID, FAKE_POST_ID);
        await route.continue({postData: sentBody});
    });

    const alert = new Promise<string>((resolve) =>
        page.once('dialog', async (dialog) => {
            resolve(dialog.message());
            await dialog.accept();
        }),
    );
    await page.getByRole('button', {name: '삭제'}).first().click();
    await page.locator('.fixed').getByRole('button', {name: '삭제'}).click();
    const message = await Promise.race([
        alert,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
    ]);
    await page.close();
    return {sentBody, alert: classifyDeleteAlert(message)};
}

async function main() {
    mkdirSync(outDir, {recursive: true});
    const session = await adminSessionCookie();
    const cookie = `${session.name}=${session.value}`;
    const index: string[] = [];

    const sitemap = await record('/sitemap.xml', 'anon', cookie, index);
    const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (m) => new URL(m[1]).pathname,
    );
    const postSlugs = sitemapPaths
        .filter((p) => p.startsWith('/blog/post/'))
        .map((p) => p.replace('/blog/post/', ''));

    for (const urlPath of [...sitemapPaths, ...PUBLIC_EXTRAS.slice(1)]) {
        const html = await record(urlPath, 'anon', cookie, index);
        const ogImage = /<meta property="og:image" content="https?:\/\/[^/]+([^"]+)"/.exec(html);
        if (urlPath.startsWith('/blog/post/') && ogImage) {
            await record(new URL(ogImage[1], base).pathname, 'anon', cookie, index);
            await record(`${urlPath}/cover`, 'anon', cookie, index);
        }
    }

    const firstSlug = postSlugs[0];
    for (const urlPath of [
        ...ADMIN_PATHS,
        `/admin/board/editor/${firstSlug}`,
        '/admin/board/editor/no-such-post',
        `/api/blog/posts/${firstSlug}`,
    ]) {
        await record(urlPath, 'anon', cookie, index);
        await record(urlPath, 'admin', cookie, index);
    }

    writeFileSync(path.join(outDir, 'index.tsv'), index.sort().join('\n') + '\n');

    const browser = await chromium.launch();
    const newContext = async () => {
        const context = await browser.newContext();
        // tsx compiles named closures with an __name() helper that page.evaluate
        // ships to the browser without its definition.
        await context.addInitScript({content: 'window.__name = (fn) => fn;'});
        await context.addCookies([{...session, url: base}]);
        return context;
    };

    const editors = {
        create: await captureCreateEditor(await newContext()),
        edit: Object.fromEntries(
            await Promise.all(
                postSlugs
                    .slice(0, 3)
                    .map(async (slug) => [slug, await captureEditEditor(await newContext(), slug)]),
            ),
        ),
        deleteGuard: {
            withSession: await probeDeleteGuard(await newContext(), true),
            withoutSession: await probeDeleteGuard(await newContext(), false),
        },
    };
    await browser.close();

    writeFileSync(path.join(outDir, 'editors.json'), JSON.stringify(editors, null, 2) + '\n');
    console.log(`recorded ${index.length} responses and editor state into ${outDir}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
