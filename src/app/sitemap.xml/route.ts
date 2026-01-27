import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export const revalidate = 3600;

export async function GET() {
    try {
        const base = 'https://blog.beenslab.com';

        const postsData = await prisma.post.findMany({
            where: {delete_time: null},
            orderBy: {create_time: 'desc'},
            include: {
                PostOnCategory: {
                    include: {
                        category: {
                            select: {keyword: true, title: true},
                        },
                    },
                },
            },
        });

        const posts = postsData.map((post: {slug: string | null; update_time: Date}) => ({
            slug: post.slug || '',
            update_time: post.update_time.toISOString(),
        }));

        const categories = await prisma.category.findMany({
            select: {keyword: true},
        });

        const mostRecentPostUpdate =
            posts.length > 0
                ? new Date(
                      Math.max(
                          ...posts.map((p: {update_time: string}) =>
                              new Date(p.update_time).getTime(),
                          ),
                      ),
                  )
                : new Date();

        const postUrls = posts
            .map(
                (p: {slug: string; update_time: string}) => `  <url>
    <loc>${base}/blog/post/${p.slug}</loc>
    <lastmod>${new Date(p.update_time).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
            )
            .join('\n');

        const categoryUrls = categories
            .map(
                (cat: {keyword: string}) => `  <url>
    <loc>${base}/category?filter=${cat.keyword}</loc>
    <lastmod>${mostRecentPostUpdate.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
${postUrls}
${categoryUrls}
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
