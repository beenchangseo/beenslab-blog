import {cache} from 'react';
import {Prisma} from '@prisma/client';
import {prisma} from '@/lib/prisma';
import {requireSession} from '@/lib/auth';
import {PostSummary, PostDetail, Category, Series, PostStatus} from '@/types/blog';

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

const publicWhere = {delete_time: null, status: 'PUBLISHED'} satisfies Prisma.PostWhereInput;

const publicOrder = [
    {published_at: 'desc'},
    {create_time: 'desc'},
] satisfies Prisma.PostOrderByWithRelationInput[];

function toSeriesDto(post: PostWithRelations) {
    if (!post.series) return null;
    return {slug: post.series.slug, title: post.series.title, order: post.series_order};
}

function toListDto(post: PostWithRelations): PostSummary {
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

function toDetailDto(post: PostWithRelations): PostDetail {
    return {
        ...toListDto(post),
        user_id: post.user_id,
        tags: post.tags,
        contents: post.contents,
    };
}

export const getAllPosts = cache(async (): Promise<PostSummary[]> => {
    const posts = await prisma.post.findMany({
        where: publicWhere,
        orderBy: publicOrder,
        include: includeRelations,
    });

    return posts.map(toListDto);
});

export const getPostBySlug = cache(async (slug: string): Promise<PostDetail | null> => {
    const post = await prisma.post.findFirst({
        where: {...publicWhere, slug},
        include: includeRelations,
    });

    return post ? toDetailDto(post) : null;
});

export const getAllPostsForAdmin = cache(async (): Promise<PostSummary[]> => {
    await requireSession();
    const posts = await prisma.post.findMany({
        where: {delete_time: null},
        orderBy: {update_time: 'desc'},
        include: includeRelations,
    });

    return posts.map(toListDto);
});

export const getPostBySlugForAdmin = cache(async (slug: string): Promise<PostDetail | null> => {
    await requireSession();
    const post = await prisma.post.findFirst({
        where: {slug, delete_time: null},
        include: includeRelations,
    });

    return post ? toDetailDto(post) : null;
});

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
    async (): Promise<Category[]> =>
        prisma.category.findMany({
            select: {id: true, title: true, keyword: true},
            orderBy: {title: 'asc'},
        }),
);

export const getSeriesList = cache(
    async (): Promise<Series[]> =>
        prisma.series.findMany({
            select: {id: true, slug: true, title: true, description: true},
            orderBy: {title: 'asc'},
        }),
);

export const POSTS_PER_PAGE = 12;

export type PostPage = {
    posts: PostSummary[];
    total: number;
    totalPages: number;
};

export function pageCount(total: number): number {
    return Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
}

async function findPublicPage(where: Prisma.PostWhereInput, page: number): Promise<PostPage> {
    const current = Math.max(1, Math.floor(page) || 1);

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

    return {posts: posts.map(toListDto), total, totalPages: pageCount(total)};
}

export const getPublishedPostCount = cache(() => prisma.post.count({where: publicWhere}));

export const getPostPage = cache((page: number) => findPublicPage(publicWhere, page));

// PostgreSQL's default text-search parser cannot split Korean words, so search uses
// ILIKE substring matching, backed by the pg_trgm GIN index from
// 20260920120553_add_trigram_search.
export const searchPosts = cache(async (query: string, page = 1): Promise<PostPage> => {
    const q = query.trim();
    if (!q) {
        return {posts: [], total: 0, totalPages: 1};
    }

    return findPublicPage(
        {
            ...publicWhere,
            OR: [
                {title: {contains: q, mode: 'insensitive'}},
                {description: {contains: q, mode: 'insensitive'}},
                {contents: {contains: q, mode: 'insensitive'}},
            ],
        },
        page,
    );
});
