'use client';

import {useRouter} from 'next/navigation';
import {FormEvent, useState} from 'react';

// 검색이 서버로 넘어가면서 타이핑마다 거르던 방식을 버렸다. 엔터를 눌러야
// /search?q= 로 이동한다. 대신 제목·설명뿐 아니라 본문까지 찾는다.
export default function SearchForm({initialQuery = ''}: {initialQuery?: string}) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const q = query.trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/blog');
    }

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            className="flex h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface-subtle px-4 focus-within:ring-2 focus-within:ring-brand-500"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 shrink-0 text-ink-muted"
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
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목, 설명, 본문에서 검색"
                aria-label="게시글 검색"
                className="h-full flex-1 appearance-none bg-transparent outline-hidden"
            />
        </form>
    );
}
