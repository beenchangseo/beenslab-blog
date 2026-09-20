import {NextResponse} from 'next/server';
import {getPostBySlugForAdmin} from '@/lib/posts';
import {getSession} from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 에디터가 수정할 글을 불러오는 용도라 초안도 내려준다. 그래서 세션 확인이
// 필수다. 이 경로는 /admin 아래가 아니라서 proxy(미들웨어)가 막아주지 않는다.
export async function GET(request: Request, props: {params: Promise<{slug: string}>}) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const params = await props.params;
    try {
        const post = await getPostBySlugForAdmin(params.slug);

        if (!post) {
            return NextResponse.json({error: 'Post not found'}, {status: 404});
        }

        return NextResponse.json({data: post});
    } catch (error) {
        console.error('Failed to fetch post:', error);
        return NextResponse.json({error: 'Failed to fetch post'}, {status: 500});
    }
}
