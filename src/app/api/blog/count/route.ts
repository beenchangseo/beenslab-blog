import {NextResponse} from 'next/server';
import {redis} from '@/lib/redis';

// Runs on the Node.js runtime so it executes in the project's function region (icn1).
export const dynamic = 'force-dynamic';

const ALLOWED_DOMAIN = 'blog.beenslab.com';
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DAILY_KEY_TTL_SECONDS = 60 * 60 * 48;

// "Today" follows Korean time so the daily count resets at midnight KST.
function getTodayDate(): string {
    return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul'}).format(new Date());
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

        if (domain !== ALLOWED_DOMAIN || postId.length > 200 || !SLUG_PATTERN.test(postId)) {
            return new NextResponse('Invalid post_id or domain parameter', {status: 400});
        }

        const totalKey = `blog-hits:${domain}:${postId}:total`;
        const dailyKey = `blog-hits:${domain}:${postId}:${getTodayDate()}`;

        // INCR is atomic, so concurrent views are not lost.
        const [totalHits, todayHits] = await redis
            .pipeline()
            .incr(totalKey)
            .incr(dailyKey)
            .expire(dailyKey, DAILY_KEY_TTL_SECONDS)
            .exec();

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
