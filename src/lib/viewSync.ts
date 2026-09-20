import {prisma} from '@/lib/prisma';
import {redis} from '@/lib/redis';

const DOMAIN = 'blog.beenslab.com';

export type ViewSyncResult = {
    checked: number;
    updated: number;
};

// 실시간 카운팅은 /api/blog/count가 Redis에 하고, 목록에서 인기 글을 정렬하려면
// 그 값이 DB에도 있어야 한다. Redis가 원본이라 여러 번 돌려도 결과가 같다.
export async function syncViewCounts(): Promise<ViewSyncResult> {
    const posts = await prisma.post.findMany({
        where: {delete_time: null},
        select: {id: true, slug: true, view_count: true},
    });

    let updated = 0;

    for (const post of posts) {
        const total = await redis.get(`blog-hits:${DOMAIN}:${post.slug}:total`);
        const count = Number(total ?? 0);

        if (!Number.isFinite(count) || count === post.view_count) {
            continue;
        }

        await prisma.post.update({
            where: {id: post.id},
            data: {view_count: count},
        });
        updated += 1;
    }

    return {checked: posts.length, updated};
}
