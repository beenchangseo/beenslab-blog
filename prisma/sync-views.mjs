// Redis에 쌓인 누적 조회수를 post.view_count로 옮긴다.
//
//   node --env-file=.env prisma/sync-views.mjs
//
// 실시간 카운팅은 /api/blog/count가 Redis에 하고, 이 스크립트는 목록에서
// 인기 글을 정렬할 수 있도록 주기적으로 DB에 반영하는 용도다. Redis가
// 원본이므로 여러 번 돌려도 결과가 같다.
//
// 주의: 저장소의 .env에는 KV_REST_API_URL이 placeholder로 들어 있다.
// 실제 값은 Vercel 환경변수에 있으니 `vercel env pull`로 받아서 쓰거나
// 값을 직접 넣고 실행할 것.

import {PrismaClient} from '@prisma/client';
import {Redis} from '@upstash/redis';

const DOMAIN = 'blog.beenslab.com';

const prisma = new PrismaClient();
const redis = Redis.fromEnv();

const posts = await prisma.post.findMany({
    where: {delete_time: null},
    select: {id: true, slug: true, view_count: true},
});

console.log(`대상 글 ${posts.length}개`);

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
    console.log(`  ${post.slug}: ${post.view_count} -> ${count}`);
    updated += 1;
}

console.log(`${updated}개 갱신`);
await prisma.$disconnect();
