import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            where: {
                delete_time: null, // Soft delete 필터
            },
            orderBy: {
                create_time: 'desc',
            },
            include: {
                PostOnCategory: {
                    include: {
                        category: {
                            select: {
                                keyword: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        const response = posts.map((post) => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            description: post.description,
            categories: post.PostOnCategory.map((item) => item.category.keyword),
            update_time: post.update_time,
            create_time: post.create_time,
        }));

        return NextResponse.json({data: response});
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return NextResponse.json({error: 'Failed to fetch posts'}, {status: 500});
    }
}
