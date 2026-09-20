import {cache} from 'react';
import {Prisma} from '@prisma/client';
import {prisma} from '@/lib/prisma';
import {
    GetAllBlogPostResponseDto,
    GetBlogPostResponseDto,
    GetCategoryResponseDto,
    GetSeriesResponseDto,
    PostStatus,
} from '@/types/blog';

const includeRelations = {
    PostOnCategory: {
        include: {
            category: {
                select: {keyword: true, title: true},
            },
        },
    },
    series: {
        select: {slug: true, title: true},
    },
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{include: typeof includeRelations}>;

// 공개 페이지가 보는 조건. 초안과 soft delete된 글은 절대 나가면 안 된다.
const publicWhere = {delete_time: null, status: 'PUBLISHED'} satisfies Prisma.PostWhereInput;

// 공개 목록은 작성 시각이 아니라 공개 시각 순이다. 과거 글을 나중에 손봐도
// 순서가 튀지 않고, 예약 발행을 붙일 때도 이 컬럼을 그대로 쓴다.
const publicOrder = [
    {published_at: 'desc'},
    {create_time: 'desc'},
] satisfies Prisma.PostOrderByWithRelationInput[];

function toSeriesDto(post: PostWithRelations) {
    if (!post.series) return null;
    return {slug: post.series.slug, title: post.series.title, order: post.series_order};
}

function toListDto(post: PostWithRelations): GetAllBlogPostResponseDto {
    return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        cover_image: post.cover_image,
        categories: post.PostOnCategory.map((item) => item.category.keyword),
        status: post.status as PostStatus,
        published_at: post.published_at?.toISOString() ?? null,
        view_count: post.view_count,
        series: toSeriesDto(post),
        update_time: post.update_time.toISOString(),
        create_time: post.create_time.toISOString(),
    };
}

function toDetailDto(post: PostWithRelations): GetBlogPostResponseDto {
    return {
        ...toListDto(post),
        user_id: post.user_id,
        tags: post.tags,
        contents: post.contents,
    };
}

// Shared by pages and API routes. Dates are serialized to ISO strings so the
// results can be passed to client components and returned as JSON unchanged.
export const getAllPosts = cache(async (): Promise<GetAllBlogPostResponseDto[]> => {
    const posts = await prisma.post.findMany({
        where: publicWhere,
        orderBy: publicOrder,
        include: includeRelations,
    });

    return posts.map(toListDto);
});

export const getPostBySlug = cache(async (slug: string): Promise<GetBlogPostResponseDto | null> => {
    const post = await prisma.post.findFirst({
        where: {...publicWhere, slug},
        include: includeRelations,
    });

    return post ? toDetailDto(post) : null;
});

// 관리자용. 초안까지 보여주고, 방금 손댄 글이 위로 오도록 수정 시각 순이다.
export const getAllPostsForAdmin = cache(async (): Promise<GetAllBlogPostResponseDto[]> => {
    const posts = await prisma.post.findMany({
        where: {delete_time: null},
        orderBy: {update_time: 'desc'},
        include: includeRelations,
    });

    return posts.map(toListDto);
});

// 에디터가 초안을 열 수 있어야 하므로 status로 거르지 않는다.
// 이 함수를 쓰는 곳은 반드시 세션을 먼저 확인할 것.
export const getPostBySlugForAdmin = cache(
    async (slug: string): Promise<GetBlogPostResponseDto | null> => {
        const post = await prisma.post.findFirst({
            where: {slug, delete_time: null},
            include: includeRelations,
        });

        return post ? toDetailDto(post) : null;
    },
);

// 제목이 바뀌면 slug가 새로 생성돼 옛 URL이 깨진다. 예전 slug로 들어온
// 요청을 현재 slug로 넘겨주기 위한 조회.
export const getSlugRedirect = cache(async (oldSlug: string): Promise<string | null> => {
    const history = await prisma.postSlugHistory.findUnique({
        where: {old_slug: oldSlug},
        select: {post: {select: {slug: true, status: true, delete_time: true}}},
    });

    if (!history?.post || history.post.delete_time || history.post.status !== 'PUBLISHED') {
        return null;
    }

    return history.post.slug;
});

export const getCategories = cache(
    async (): Promise<GetCategoryResponseDto[]> =>
        prisma.category.findMany({
            select: {id: true, title: true, keyword: true},
            orderBy: {title: 'asc'},
        }),
);

export const getSeriesList = cache(
    async (): Promise<GetSeriesResponseDto[]> =>
        prisma.series.findMany({
            select: {id: true, slug: true, title: true, description: true},
            orderBy: {title: 'asc'},
        }),
);

export const POSTS_PER_PAGE = 12;

export type PostPage = {
    posts: GetAllBlogPostResponseDto[];
    total: number;
    totalPages: number;
};

// 목록 한 페이지. 전체를 클라이언트로 내리던 걸 DB에서 잘라 온다.
export const getPostPage = cache(async (page: number): Promise<PostPage> => {
    const current = Math.max(1, Math.floor(page) || 1);

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where: publicWhere,
            orderBy: publicOrder,
            include: includeRelations,
            skip: (current - 1) * POSTS_PER_PAGE,
            take: POSTS_PER_PAGE,
        }),
        prisma.post.count({where: publicWhere}),
    ]);

    return {
        posts: posts.map(toListDto),
        total,
        totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
    };
});

// 제목·설명·본문을 함께 찾는다. 한글은 PostgreSQL 기본 전문검색 파서가
// 제대로 못 자르므로 ILIKE로 부분 일치를 보고, pg_trgm GIN 인덱스가 그걸
// 받쳐준다(20260920120553_add_trigram_search).
export const searchPosts = cache(async (query: string, page = 1): Promise<PostPage> => {
    const q = query.trim();
    if (!q) {
        return {posts: [], total: 0, totalPages: 1};
    }

    const current = Math.max(1, Math.floor(page) || 1);
    const where = {
        ...publicWhere,
        OR: [
            {title: {contains: q, mode: 'insensitive'}},
            {description: {contains: q, mode: 'insensitive'}},
            {contents: {contains: q, mode: 'insensitive'}},
        ],
    } satisfies Prisma.PostWhereInput;

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            orderBy: publicOrder,
            include: includeRelations,
            skip: (current - 1) * POSTS_PER_PAGE,
            take: POSTS_PER_PAGE,
        }),
        prisma.post.count({where}),
    ]);

    return {
        posts: posts.map(toListDto),
        total,
        totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
    };
});
