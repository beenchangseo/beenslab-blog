import {prisma} from '@/lib/prisma';
import {redis} from '@/lib/redis';
import {SITE_HOST} from '@/lib/site';

export function totalViewsKey(slug: string): string {
    return `blog-hits:${SITE_HOST}:${slug}:total`;
}

export function dailyViewsKey(slug: string, date: string): string {
    return `blog-hits:${SITE_HOST}:${slug}:${date}`;
}

export type ViewSyncResult = {
    checked: number;
    updated: number;
};

export async function syncViewCounts(): Promise<ViewSyncResult> {
    const posts = await prisma.post.findMany({
        where: {delete_time: null},
        select: {id: true, slug: true, view_count: true},
    });

    let updated = 0;

    for (const post of posts) {
        const total = await redis.get(totalViewsKey(post.slug));
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
