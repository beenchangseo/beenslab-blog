'use server';

import {prisma} from '@/lib/prisma';
import {Prisma} from '@prisma/client';
import {revalidatePath} from 'next/cache';
import {getSession} from '@/lib/auth';
import {generateSlugFromTitle} from '@/lib/slugify';

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

        if (!existing) {
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
        const {title, description, contents, tags, categoryIds} = input;

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
        const {postId, title, description, contents, tags, categoryIds} = input;

        const existingPost = await prisma.post.findUnique({
            where: {id: postId},
            include: {PostOnCategory: true},
        });

        if (!existingPost) {
            return {success: false, error: 'Post not found'};
        }

        let slug = existingPost.slug || '';
        if (existingPost.title !== title) {
            const baseSlug = generateSlugFromTitle(title);
            slug = await ensureUniqueSlug(baseSlug, postId);
        }

        const post = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const updatedPost = await tx.post.update({
                where: {id: postId},
                data: {
                    title,
                    slug,
                    description,
                    contents,
                    tags,
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
