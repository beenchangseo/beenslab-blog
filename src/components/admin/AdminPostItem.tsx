'use client';

import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {softDeletePost} from '@/app/actions/posts';
import {GetAllBlogPostResponseDto} from '@/types/blog';

export default function AdminPostItem({post}: {post: GetAllBlogPostResponseDto}) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        try {
            const result = await softDeletePost(post.id);
            if (result.success) {
                alert('게시글이 삭제되었습니다.');
                setShowDeleteModal(false);
                router.refresh();
            } else {
                alert(`삭제 실패: ${result.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="w-full my-7">
                <Link href={`/blog/post/${post.slug}`} passHref>
                    <div className="flex items-center gap-2 font-medium text-xs transition text-gray-500 dark:text-gray-300">
                        <span>
                            {new Date(post.published_at ?? post.create_time).toLocaleDateString()}
                        </span>
                        {post.status === 'DRAFT' && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                초안
                            </span>
                        )}
                        {post.view_count > 0 && (
                            <span>조회 {post.view_count.toLocaleString()}</span>
                        )}
                    </div>
                    <div className="font-extrabold text-xl sm:text-2xl mt-2 transition text-black dark:text-white hover:text-green-500 dark:hover:text-green-500">
                        {post.title}
                    </div>
                    <div className="font-medium text-base transition text-gray-600 dark:text-gray-400 sm:text-lg mt-1">
                        {post.description}
                    </div>
                </Link>
                <div className="flex flex-wrap gap-2 mt-3">
                    {post.categories.map((category) => (
                        <Link
                            key={category}
                            href={`/category/${category}`}
                            className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                            {category}
                        </Link>
                    ))}
                </div>
                <div className="flex gap-2 mt-3">
                    <Link
                        href={`/admin/board/editor/${post.slug}`}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-sm hover:bg-blue-600"
                    >
                        수정
                    </Link>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-sm hover:bg-red-600"
                    >
                        삭제
                    </button>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">게시글 삭제</h2>
                        <p className="mb-6">정말로 이 게시글을 삭제하시겠습니까?</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
