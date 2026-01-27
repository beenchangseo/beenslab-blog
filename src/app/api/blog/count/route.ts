import {NextResponse} from 'next/server';
import {kv} from '@/lib/kv';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

function generateSVG(todayHits: number, totalHits: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20" role="img" aria-label="Hits">
  <linearGradient id="bg" x2="0" y2="100%">
    <stop offset="0" stop-color="#444" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect rx="3" width="200" height="20" fill="#555"/>
  <rect rx="3" x="70" width="130" height="20" fill="#007ec6"/>
  <rect rx="3" width="200" height="20" fill="url(#bg)"/>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="35" y="14">Hits</text>
    <text x="135" y="14">Today: ${todayHits} | Total: ${totalHits}</text>
  </g>
</svg>`;
}

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const postId = searchParams.get('post_id');
        const domain = searchParams.get('domain');

        if (!postId || !domain) {
            return new NextResponse('Missing post_id or domain parameter', {status: 400});
        }

        const today = getTodayDate();
        const key = `blog-hits:${domain}:${postId}`;

        const data =
            (await kv.get<{total_hits?: number; today_hits?: number; last_hits_date?: string}>(
                key,
            )) || {};

        const prevTotal = data.total_hits || 0;
        const prevToday = data.today_hits || 0;
        const lastDate = data.last_hits_date || '';

        const totalHits = prevTotal + 1;
        const todayHits = lastDate === today ? prevToday + 1 : 1;

        await kv.set(key, {
            total_hits: totalHits,
            today_hits: todayHits,
            last_hits_date: today,
        });

        const svg = generateSVG(todayHits, totalHits);

        return new NextResponse(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
            },
        });
    } catch (error) {
        console.error('Visit counter error:', error);
        return new NextResponse('Internal Server Error', {status: 500});
    }
}
