import {NextResponse} from 'next/server';
import {getPostBySlug} from '@/lib/posts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, props: {params: Promise<{slug: string}>}) {
    const params = await props.params;
    try {
        const post = await getPostBySlug(params.slug);

        if (!post) {
            return NextResponse.json({error: 'Post not found'}, {status: 404});
        }

        return NextResponse.json({data: post});
    } catch (error) {
        console.error('Failed to fetch post:', error);
        return NextResponse.json({error: 'Failed to fetch post'}, {status: 500});
    }
}
