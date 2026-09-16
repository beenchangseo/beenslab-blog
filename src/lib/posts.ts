import {cache} from 'react';
import {Prisma} from '@prisma/client';
import {prisma} from '@/lib/prisma';
import {
    GetAllBlogPostResponseDto,
    GetBlogPostResponseDto,
    GetCategoryResponseDto,
} from '@/types/blog';

const includeCategories = {
    PostOnCategory: {
        include: {
            category: {
                select: {keyword: true, title: true},
            },
        },
    },
} satisfies Prisma.PostInclude;

// Shared by pages and API routes. Dates are serialized to ISO strings so the
// results can be passed to client components and returned as JSON unchanged.
export const getAllPosts = cache(async (): Promise<GetAllBlogPostResponseDto[]> => {
    const posts = await prisma.post.findMany({
        where: {delete_time: null},
        orderBy: {create_time: 'desc'},
        include: includeCategories,
    });

    return posts.map((post) => ({
        id: post.id,
        slug: post.slug ?? '',
        title: post.title,
        description: post.description,
        categories: post.PostOnCategory.map((item) => item.category.keyword),
        update_time: post.update_time.toISOString(),
        create_time: post.create_time.toISOString(),
    }));
});

export const getPostBySlug = cache(async (slug: string): Promise<GetBlogPostResponseDto | null> => {
    const post = await prisma.post.findFirst({
        where: {slug, delete_time: null},
        include: includeCategories,
    });

    if (!post) {
        return null;
    }

    return {
        id: post.id,
        user_id: post.user_id,
        slug: post.slug ?? '',
        title: post.title,
        description: post.description,
        tags: post.tags,
        categories: post.PostOnCategory.map((item) => item.category.keyword),
        contents: post.contents,
        update_time: post.update_time.toISOString(),
        create_time: post.create_time.toISOString(),
    };
});

export const getCategories = cache(
    async (): Promise<GetCategoryResponseDto[]> =>
        prisma.category.findMany({
            select: {id: true, title: true, keyword: true},
        }),
);
