import {NextResponse} from 'next/server';
import {getSeriesList} from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const series = await getSeriesList();

        return NextResponse.json({data: series});
    } catch (error) {
        console.error('Failed to fetch series:', error);
        return NextResponse.json({error: 'Failed to fetch series'}, {status: 500});
    }
}
