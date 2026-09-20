'use client';

import {ChangeEvent, useMemo, useState} from 'react';
import PostGrid from './PostGrid';
import {GetAllBlogPostResponseDto, GetCategoryResponseDto} from '@/types/blog';

type Props = {
    posts: GetAllBlogPostResponseDto[];
    categories: GetCategoryResponseDto[];
};

const PAGE_SIZE = 12;

export default function PostSearch({posts, categories}: Props) {
    const [query, setQuery] = useState('');
    const [visible, setVisible] = useState(PAGE_SIZE);

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

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setVisible(PAGE_SIZE);
    };

    // 진짜 페이지네이션(서버에서 잘라 내려주기)은 검색도 서버로 옮긴 뒤에
    // 해야 의미가 있다. 지금은 화면에 그리는 개수만 끊는다.
    const shown = filtered.slice(0, visible);
    const remaining = filtered.length - shown.length;

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

            <PostGrid posts={shown} categories={categories} />

            {remaining > 0 && (
                <div className="mt-12 flex justify-center">
                    <button
                        type="button"
                        onClick={() => setVisible((n) => n + PAGE_SIZE)}
                        className="rounded-xl border border-line px-6 py-3 text-sm font-semibold transition-colors hover:border-brand-500 hover:text-brand-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                        {remaining}개 더 보기
                    </button>
                </div>
            )}
        </>
    );
}
