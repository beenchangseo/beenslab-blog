'use server';

import {prisma} from '@/lib/prisma';
import {Prisma} from '@prisma/client';
import {revalidatePath} from 'next/cache';
import {getSession, SessionPayload} from '@/lib/auth';
import {generateSlugFromTitle} from '@/lib/slugify';

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

type ActionResult<T> = {success: true; data: T} | {success: false; error: string};

// A Server Action can be called by anyone who can POST to a route that imports it,
// and proxy.ts only covers /admin/*. Every mutation goes through this wrapper so the
// session check, the error shape, and cache invalidation are never left out.
// Blog pages are statically cached, so every change revalidates all of them.
async function adminAction<T>(
    label: string,
    run: (session: SessionPayload) => Promise<T>,
): Promise<ActionResult<T>> {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        const data = await run(session);
        revalidatePath('/', 'layout');
        return {success: true, data};
    } catch (error) {
        console.error(`Failed to ${label}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : `Failed to ${label}`,
        };
    }
}

// Text copied on macOS arrives as NFD (decomposed jamo). Browsers render it fine, but
// Satori, which draws the cover images, has no glyphs for the jamo block and draws
// boxes. Search and sorting also break when NFC and NFD mix, so normalize on save.
function toNfc(value: string): string {
    return value.normalize('NFC');
}

function editableFields(input: CreatePostInput) {
    return {
        title: toNfc(input.title),
        description: toNfc(input.description),
        contents: toNfc(input.contents),
        tags: input.tags.map(toNfc),
        cover_image: input.coverImage ?? null,
        series_id: input.seriesId ?? null,
        series_order: input.seriesOrder ?? null,
    };
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

        // Old slugs are taken too. Otherwise a new post would claim another post's
        // redirect address and old links would land on the wrong post.
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

async function linkCategories(tx: Prisma.TransactionClient, postId: string, categoryIds: string[]) {
    if (categoryIds.length > 0) {
        await tx.postOnCategory.createMany({
            data: categoryIds.map((categoryId) => ({post_id: postId, category_id: categoryId})),
        });
    }
}

export async function createPost(input: CreatePostInput) {
    return adminAction('create post', async (session) => {
        const fields = editableFields(input);
        const publish = input.publish ?? false;
        const slug = await ensureUniqueSlug(generateSlugFromTitle(fields.title));

        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const post = await tx.post.create({
                data: {
                    ...fields,
                    slug,
                    // New posts are drafts unless the editor's publish button was used.
                    status: publish ? 'PUBLISHED' : 'DRAFT',
                    published_at: publish ? new Date() : null,
                    user_id: session.userId,
                    update_time: new Date(),
                },
            });
            await linkCategories(tx, post.id, input.categoryIds);
            return post;
        });
    });
}

export async function updatePost(input: UpdatePostInput) {
    return adminAction('update post', async () => {
        const {postId} = input;
        const fields = editableFields(input);
        const publish = input.publish ?? false;

        const existing = await prisma.post.findUnique({where: {id: postId}});
        if (!existing) {
            throw new Error('Post not found');
        }

        const previousSlug = existing.slug;
        const slug =
            existing.title === fields.title
                ? previousSlug
                : await ensureUniqueSlug(generateSlugFromTitle(fields.title), postId);

        // published_at is stamped only on the first draft-to-published transition, so
        // editing an old post does not move it to the top of the list.
        const wasPublished = existing.status === 'PUBLISHED';
        const published_at =
            publish && !wasPublished ? new Date() : publish ? existing.published_at : null;

        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            if (slug !== previousSlug) {
                // A history row for the new slug pointed somewhere else and is now void.
                await tx.postSlugHistory.deleteMany({where: {old_slug: slug}});
                // Keep the old address so the post page can redirect it.
                await tx.postSlugHistory.upsert({
                    where: {old_slug: previousSlug},
                    create: {old_slug: previousSlug, post_id: postId},
                    update: {post_id: postId},
                });
            }

            const post = await tx.post.update({
                where: {id: postId},
                data: {
                    ...fields,
                    slug,
                    status: publish ? 'PUBLISHED' : 'DRAFT',
                    published_at,
                    update_time: new Date(),
                },
            });

            await tx.postOnCategory.deleteMany({where: {post_id: postId}});
            await linkCategories(tx, postId, input.categoryIds);
            return post;
        });
    });
}

export async function softDeletePost(postId: string) {
    return adminAction('delete post', () =>
        prisma.post.update({
            where: {id: postId},
            data: {delete_time: new Date()},
        }),
    );
}
