import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, {params}: {params: {slug: string}}) {
    try {
        const {slug} = params;

        const post = await prisma.post.findFirst({
            where: {
                slug,
                delete_time: null, // Soft delete 필터
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

        if (!post) {
            return NextResponse.json({error: 'Post not found'}, {status: 404});
        }

        const response = {
            id: post.id,
            user_id: post.user_id,
            slug: post.slug,
            title: post.title,
            description: post.description,
            tags: post.tags,
            categories: post.PostOnCategory.map((item) => item.category.keyword),
            contents: post.contents,
            update_time: post.update_time,
            create_time: post.create_time,
        };

        return NextResponse.json({data: response});
    } catch (error) {
        console.error('Failed to fetch post:', error);
        return NextResponse.json({error: 'Failed to fetch post'}, {status: 500});
    }
}
