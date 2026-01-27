import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                title: true,
                keyword: true,
            },
        });

        return NextResponse.json({data: categories});
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return NextResponse.json({error: 'Failed to fetch categories'}, {status: 500});
    }
}
