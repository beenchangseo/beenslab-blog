'use server';

import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import {getSession} from '@/lib/auth';

export interface CreateCategoryInput {
    keyword: string;
    title: string;
}

export interface UpdateCategoryInput {
    categoryId: string;
    keyword: string;
    title: string;
}

export async function createCategory(input: CreateCategoryInput) {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        const {keyword, title} = input;

        const existingCategory = await prisma.category.findUnique({
            where: {keyword},
        });

        if (existingCategory) {
            return {success: false, error: 'Category keyword already exists'};
        }

        const category = await prisma.category.create({
            data: {keyword, title},
        });

        revalidatePath('/', 'layout');

        return {success: true, data: category};
    } catch (error) {
        console.error('Create category error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create category',
        };
    }
}

export async function updateCategory(input: UpdateCategoryInput) {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        const {categoryId, keyword, title} = input;

        const existingCategory = await prisma.category.findFirst({
            where: {
                keyword,
                id: {not: categoryId},
            },
        });

        if (existingCategory) {
            return {success: false, error: 'Category keyword already exists'};
        }

        const category = await prisma.category.update({
            where: {id: categoryId},
            data: {keyword, title},
        });

        revalidatePath('/', 'layout');

        return {success: true, data: category};
    } catch (error) {
        console.error('Update category error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update category',
        };
    }
}

export async function deleteCategory(categoryId: string) {
    const session = await getSession();
    if (!session) {
        return {success: false, error: 'Unauthorized'};
    }

    try {
        const postsWithCategory = await prisma.postOnCategory.findMany({
            where: {category_id: categoryId},
        });

        if (postsWithCategory.length > 0) {
            return {
                success: false,
                error: `Cannot delete category: ${postsWithCategory.length} posts are using this category`,
            };
        }

        await prisma.category.delete({
            where: {id: categoryId},
        });

        revalidatePath('/', 'layout');

        return {success: true};
    } catch (error) {
        console.error('Delete category error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete category',
        };
    }
}
