import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {syncViewCounts} from '@/lib/views';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` only when CRON_SECRET is set.
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

        if (result.updated > 0) {
            revalidatePath('/');
        }

        return NextResponse.json({ok: true, ...result});
    } catch (error) {
        console.error('View sync failed:', error);
        return NextResponse.json({error: 'Sync failed'}, {status: 500});
    }
}
