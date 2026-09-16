'use client';

import {useState} from 'react';
import CategoryList from './CategoryList';
import PostList from '../PostList';
import {useSearchParams} from 'next/navigation';
import {GetAllBlogPostResponseDto, GetCategoryResponseDto} from '../../types/blog';

interface CategoryFilterProps {
    posts: GetAllBlogPostResponseDto[];
    categories: GetCategoryResponseDto[];
    initialSelect?: string;
}

export default function CategoryFilter({
    posts,
    categories,
    initialSelect = '',
}: CategoryFilterProps) {
    const [select, setSelect] = useState(initialSelect);

    const filteredPosts =
        select === '' ? posts : posts.filter((post) => post.categories.includes(select));
    return (
        <>
            <section className="mt-12 mb-8 flex flex-col gap-12">
                <h1 className="font-bold text-2xl sm:text-4xl font-mono">🗂 Category</h1>
                <CategoryList select={select} setSelect={setSelect} categories={categories} />
            </section>
            <PostList posts={filteredPosts} />
        </>
    );
}

export function CategoryFilterFromSearchParams(props: Omit<CategoryFilterProps, 'initialSelect'>) {
    const searchParams = useSearchParams();
    return <CategoryFilter {...props} initialSelect={searchParams.get('filter') || ''} />;
}
