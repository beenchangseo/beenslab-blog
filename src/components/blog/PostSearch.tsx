'use client';

import {ChangeEvent, useMemo, useState} from 'react';
import PostGrid from './PostGrid';
import {GetAllBlogPostResponseDto, GetCategoryResponseDto} from '@/types/blog';

type Props = {
    posts: GetAllBlogPostResponseDto[];
    categories: GetCategoryResponseDto[];
};

export default function PostSearch({posts, categories}: Props) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return posts;
        // 제목만 보던 걸 설명까지 본다. 본문 검색은 전체를 클라이언트로
        // 내려야 해서 서버 검색이 생길 때까지 미룬다.
        return posts.filter(
            (post) =>
                post.title.toLowerCase().includes(q) || post.description.toLowerCase().includes(q),
        );
    }, [posts, query]);

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

    return (
        <>
            <div className="mb-10 flex h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface-subtle px-4 focus-within:ring-2 focus-within:ring-brand-500">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-ink-muted"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
                <input
                    type="search"
                    value={query}
                    onChange={handleSearch}
                    placeholder="제목이나 설명으로 검색"
                    aria-label="게시글 검색"
                    className="h-full flex-1 appearance-none bg-transparent outline-hidden"
                />
                {query && (
                    <span className="shrink-0 text-sm text-ink-muted">{filtered.length}건</span>
                )}
            </div>

            <PostGrid posts={filtered} categories={categories} />
        </>
    );
}
