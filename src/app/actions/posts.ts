'use server';

import {prisma} from '@/lib/prisma';
import {Prisma} from '@prisma/client';
import {revalidatePath} from 'next/cache';
import {getSession} from '@/lib/auth';
import {generateSlugFromTitle} from '@/lib/slugify';

// macOS에서 복사한 한글은 NFD(자모 분리) 상태로 들어온다. 브라우저는 합쳐서
// 보여주지만 커버 이미지를 그리는 Satori는 자모 글리프를 못 찾아 두부(□)가
// 된다. 검색·정렬도 NFC/NFD가 섞이면 어긋나므로 저장 직전에 맞춘다.
function toNfc(value: string): string {
    return value.normalize('NFC');
}

async function ensureUniqueSlug(baseSlug: string, excludePostId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.post.findFirst({
            where: {
                slug,
                ...(excludePostId && {id: {not: excludePostId}}),
            },
        });

        // 예전 slug도 피해야 한다. 그러지 않으면 새 글이 다른 글의 리다이렉트
        // 주소를 차지해 옛 링크가 엉뚱한 곳으로 간다.
        const reserved = existing
            ? null
            : await prisma.postSlugHistory.findFirst({
                  where: {
                      old_slug: slug,
                      ...(excludePostId && {post_id: {not: excludePostId}}),
                  },
              });

        if (!existing && !reserved) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

export interface CreatePostInput {
    title: string;
    description: string;
    contents: string;
    tags: string[];
    categoryIds: string[];
    coverImage?: string | null;
    seriesId?: string | null;
    seriesOrder?: number | null;
    publish?: boolean;
}

export interface UpdatePostInput extends CreatePostInput {
    postId: string;
}

// Server Actions are reachable from every page that imports them (including public ones),
// so each action has to verify the session itself; middleware only covers /admin/*.
// Blog pages are statically cached, so every change revalidates all of them.

export async function createPost(input: CreatePostInput) {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        const {categoryIds} = input;
        const {coverImage = null, seriesId = null, seriesOrder = null, publish = false} = input;
        const title = toNfc(input.title);
        const description = toNfc(input.description);
        const contents = toNfc(input.contents);
        const tags = input.tags.map(toNfc);

        const baseSlug = generateSlugFromTitle(title);
        const slug = await ensureUniqueSlug(baseSlug);

        const post = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const newPost = await tx.post.create({
                data: {
                    title,
                    slug,
                    description,
                    contents,
                    tags,
                    cover_image: coverImage,
                    series_id: seriesId,
                    series_order: seriesOrder,
                    // 기본은 초안이다. 발행은 에디터에서 명시적으로 눌러야 한다.
                    status: publish ? 'PUBLISHED' : 'DRAFT',
                    published_at: publish ? new Date() : null,
                    user_id: session.userId,
                    update_time: new Date(),
                },
            });

            if (categoryIds.length > 0) {
                await tx.postOnCategory.createMany({
                    data: categoryIds.map((categoryId) => ({
                        post_id: newPost.id,
                        category_id: categoryId,
                    })),
                });
            }

            return newPost;
        });

        revalidatePath('/', 'layout');

        return {success: true, data: post};
    } catch (error) {
        console.error('Create post error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create post',
        };
    }
}

export async function updatePost(input: UpdatePostInput) {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        const {postId, categoryIds} = input;
        const {coverImage = null, seriesId = null, seriesOrder = null, publish = false} = input;
        const title = toNfc(input.title);
        const description = toNfc(input.description);
        const contents = toNfc(input.contents);
        const tags = input.tags.map(toNfc);

        const existingPost = await prisma.post.findUnique({
            where: {id: postId},
            include: {PostOnCategory: true},
        });

        if (!existingPost) {
            return {success: false, error: 'Post not found'};
        }

        const previousSlug = existingPost.slug;
        let slug = previousSlug;
        if (existingPost.title !== title) {
            const baseSlug = generateSlugFromTitle(title);
            slug = await ensureUniqueSlug(baseSlug, postId);
        }

        // 초안이었다가 처음 발행되는 순간에만 공개 시각을 찍는다. 이미 공개된
        // 글을 수정한다고 해서 목록 맨 위로 올라오면 안 된다.
        const wasPublished = existingPost.status === 'PUBLISHED';
        const published_at =
            publish && !wasPublished ? new Date() : publish ? existingPost.published_at : null;

        const post = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            if (slug !== previousSlug) {
                // 새 slug가 예전에 다른 용도로 쓰였다면 그 기록은 무효다.
                await tx.postSlugHistory.deleteMany({where: {old_slug: slug}});
                // 옛 주소로 들어오는 요청을 넘겨주기 위해 남긴다.
                await tx.postSlugHistory.upsert({
                    where: {old_slug: previousSlug},
                    create: {old_slug: previousSlug, post_id: postId},
                    update: {post_id: postId},
                });
            }

            const updatedPost = await tx.post.update({
                where: {id: postId},
                data: {
                    title,
                    slug,
                    description,
                    contents,
                    tags,
                    cover_image: coverImage,
                    series_id: seriesId,
                    series_order: seriesOrder,
                    status: publish ? 'PUBLISHED' : 'DRAFT',
                    published_at,
                    update_time: new Date(),
                },
            });

            await tx.postOnCategory.deleteMany({
                where: {post_id: postId},
            });

            if (categoryIds.length > 0) {
                await tx.postOnCategory.createMany({
                    data: categoryIds.map((categoryId) => ({
                        post_id: postId,
                        category_id: categoryId,
                    })),
                });
            }

            return updatedPost;
        });

        revalidatePath('/', 'layout');

        return {success: true, data: post};
    } catch (error) {
        console.error('Update post error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update post',
        };
    }
}

export async function softDeletePost(postId: string) {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        const post = await prisma.post.update({
            where: {id: postId},
            data: {
                delete_time: new Date(),
            },
        });

        revalidatePath('/', 'layout');

        return {success: true, data: post};
    } catch (error) {
        console.error('Delete post error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete post',
        };
    }
}

export async function permanentlyDeletePost(postId: string) {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.postOnCategory.deleteMany({
                where: {post_id: postId},
            });

            await tx.post.delete({
                where: {id: postId},
            });
        });

        revalidatePath('/', 'layout');

        return {success: true};
    } catch (error) {
        console.error('Permanently delete post error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to permanently delete post',
        };
    }
}
