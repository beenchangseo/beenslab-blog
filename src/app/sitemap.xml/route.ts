import {NextResponse} from 'next/server';
import {getAllPosts, getCategories} from '@/lib/posts';

export const revalidate = 3600;

export async function GET() {
    try {
        const base = 'https://blog.beenslab.com';

        const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);

        const mostRecentPostUpdate =
            posts.length > 0
                ? new Date(Math.max(...posts.map((p) => new Date(p.update_time).getTime())))
                : new Date();

        const categoryUrls = categories
            .map(
                (c) => `  <url>
    <loc>${base}/category/${c.keyword}</loc>
    <lastmod>${mostRecentPostUpdate.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
            )
            .join('\n');

        const postUrls = posts
            .map(
                (p) => `  <url>
    <loc>${base}/blog/post/${p.slug}</loc>
    <lastmod>${p.update_time}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
            )
            .join('\n');

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <lastmod>${mostRecentPostUpdate.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/blog</loc>
    <lastmod>${mostRecentPostUpdate.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${base}/category</loc>
    <lastmod>${mostRecentPostUpdate.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${base}/career</loc>
    <lastmod>2024-01-01T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
${categoryUrls}
${postUrls}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Failed to generate sitemap:', error);
        return new NextResponse('Error generating sitemap', {status: 500});
    }
}
