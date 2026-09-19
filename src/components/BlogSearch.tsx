'use client';
import {useState, ChangeEvent} from 'react';
import PostList from './PostList';
import {GetAllBlogPostResponseDto} from '../types/blog';

export default function BlogSearch({
    posts,
    showAdminButtons = false,
}: {
    posts: GetAllBlogPostResponseDto[];
    showAdminButtons?: boolean;
}) {
    const [search, setSearch] = useState('');
    const handleSearch = (e: ChangeEvent<HTMLInputElement>) =>
        setSearch(e.target.value.toLowerCase());
    const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(search));
    return (
        <>
            <section className="mt-12 mb-8 flex flex-col gap-12">
                <h1 className="font-bold text-2xl sm:text-4xl font-mono">📝 Blog</h1>
                <div className="flex flex-nowrap gap-4 items-center px-4 w-full h-16 rounded-2xl border-2 border-black dark:border-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-[#111111]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
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
                        className="flex-1 outline-hidden bg-transparent appearance-none"
                        onChange={handleSearch}
                        placeholder="검색하기"
                        aria-label="게시글 제목 검색"
                    />
                </div>
            </section>
            <PostList posts={filteredPosts} showAdminButtons={showAdminButtons} />
        </>
    );
}
