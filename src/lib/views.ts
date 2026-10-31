import {prisma} from '@/lib/prisma';
import {redis} from '@/lib/redis';
import {SITE_HOST} from '@/lib/site';

// Redis is the source of truth for view counts. post.view_count is a copy that
// lets the home page sort by popularity; syncViewCounts refreshes it.
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

// Copies Redis totals into post.view_count. Running it twice gives the same result.
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
