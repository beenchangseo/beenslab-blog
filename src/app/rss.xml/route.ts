import {NextResponse} from 'next/server';
import {getAllPosts} from '@/lib/posts';

export const revalidate = 3600;

const BASE = 'https://blog.beenslab.com';

// XML에 그대로 넣으면 안 되는 문자들. 제목에 &나 <가 들어가면 피드가 깨진다.
function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    try {
        const posts = await getAllPosts();

        const items = posts
            .map((post) => {
                const url = `${BASE}/blog/post/${post.slug}`;
                const published = new Date(post.published_at ?? post.create_time).toUTCString();

                return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${published}</pubDate>
${post.categories.map((c) => `      <category>${escapeXml(c)}</category>`).join('\n')}
    </item>`;
            })
            .join('\n');

        const latest = posts[0];
        const lastBuildDate = new Date(
            latest?.published_at ?? latest?.create_time ?? Date.now(),
        ).toUTCString();

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Beenslab Blog</title>
    <link>${BASE}</link>
    <description>백엔드, 데이터베이스, 인프라에서 겪은 것들을 기록합니다.</description>
    <language>ko</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

        return new NextResponse(rss, {
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Failed to generate RSS feed:', error);
        return new NextResponse('Error generating feed', {status: 500});
    }
}
