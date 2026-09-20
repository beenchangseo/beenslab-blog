import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {syncViewCounts} from '@/lib/viewSync';

export const dynamic = 'force-dynamic';
// Prisma가 필요하므로 Node 런타임에서 돈다. vercel.json의 regions로 icn1에 묶여 있다.
export const maxDuration = 60;

// Vercel Cron이 하루 한 번 호출한다(vercel.json의 crons).
// CRON_SECRET이 설정돼 있으면 Vercel이 Authorization: Bearer <secret>을 붙여준다.
// 비밀값이 없으면 아무나 호출할 수 있으므로, 없으면 아예 거부한다.
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        console.error('CRON_SECRET is not set; refusing to run view sync.');
        return NextResponse.json({error: 'Not configured'}, {status: 503});
    }

    if (request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    try {
        const result = await syncViewCounts();

        // 홈의 '많이 본 글' 순서가 바로 반영되게 한다. 안 하면 ISR이 만료될
        // 때까지(최대 1시간) 옛 순위가 남는다.
        if (result.updated > 0) {
            revalidatePath('/');
        }

        return NextResponse.json({ok: true, ...result});
    } catch (error) {
        console.error('View sync failed:', error);
        return NextResponse.json({error: 'Sync failed'}, {status: 500});
    }
}
