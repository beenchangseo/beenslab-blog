import {NextResponse} from 'next/server';
import {getCategories} from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const categories = await getCategories();

        return NextResponse.json({data: categories});
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return NextResponse.json({error: 'Failed to fetch categories'}, {status: 500});
    }
}
