'use client';

import MDEditor from '@uiw/react-md-editor';
import {useState, useEffect, use} from 'react';
import {updatePost} from '@/app/actions/posts';
import {useRouter} from 'next/navigation';

interface Category {
    id: string;
    keyword: string;
    title: string;
}

interface Post {
    id: string;
    slug: string;
    title: string;
    description: string;
    tags: string[];
    contents: string;
    categories: string[];
}

export default function EditPostPage(props: {params: Promise<{slug: string}>}) {
    const params = use(props.params);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [postId, setPostId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch('/api/auth/session');
            if (response.ok) {
                const data = await response.json();
                setUserId(data.userId);
            } else {
                router.push('/admin/signin');
            }
            setIsCheckingAuth(false);
        };
        checkAuth();
    }, [router]);

    async function fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            const result = await response.json();
            if (result.data) {
                setCategories(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError('카테고리를 불러오는데 실패했습니다.');
        }
    }

    async function fetchPost() {
        try {
            const response = await fetch(`/api/blog/posts/${params.slug}`);
            const result = await response.json();

            if (result.data) {
                const post: Post = result.data;
                setPostId(post.id);
                setTitle(post.title);
                setDescription(post.description);
                setTags(post.tags.join(', '));
                setContent(post.contents);

                const categoriesResponse = await fetch('/api/categories');
                const categoriesResult = await categoriesResponse.json();

                if (categoriesResult.data) {
                    const categoryKeywordToId: Record<string, string> = {};
                    categoriesResult.data.forEach((cat: Category) => {
                        categoryKeywordToId[cat.keyword] = cat.id;
                    });

                    const categoryIds = post.categories
                        .map((keyword) => categoryKeywordToId[keyword])
                        .filter(Boolean);
                    setSelectedCategoryIds(categoryIds);
                }
            } else {
                setError('포스트를 찾을 수 없습니다.');
            }
        } catch (err) {
            console.error('Failed to fetch post:', err);
            setError('포스트를 불러오는데 실패했습니다.');
        } finally {
            setIsFetching(false);
        }
    }

    // 선언보다 먼저 호출하면 react-hooks/immutability 규칙에 걸리므로
    // fetchCategories/fetchPost 선언 뒤에 둔다.
    // set-state-in-effect는 오탐이다. 두 함수 모두 await 뒤에 setState를 하므로
    // 이펙트 본문에서 동기적으로 상태를 바꾸지 않는다. 데이터 로딩을 취소 가능한
    // 형태로 정리하는 건 에디터를 손보는 Phase 3에서 함께 한다.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!isCheckingAuth && userId) {
            fetchCategories();
            fetchPost();
        }
    }, [isCheckingAuth, userId]);
    /* eslint-enable react-hooks/set-state-in-effect */

    function toggleCategory(categoryId: string) {
        setSelectedCategoryIds((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId],
        );
    }

    async function handleUpdate() {
        if (!title.trim()) {
            setError('제목을 입력해주세요.');
            return;
        }

        if (!description.trim()) {
            setError('설명을 입력해주세요.');
            return;
        }

        if (!content.trim()) {
            setError('내용을 입력해주세요.');
            return;
        }

        if (selectedCategoryIds.length === 0) {
            setError('최소 하나의 카테고리를 선택해주세요.');
            return;
        }

        if (!userId) {
            setError('로그인이 필요합니다.');
            router.push('/admin/signin');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const tagsArray = tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            const result = await updatePost({
                postId,
                title,
                description,
                contents: content,
                tags: tagsArray,
                categoryIds: selectedCategoryIds,
            });

            if (result.success && result.data) {
                alert('게시글이 성공적으로 수정되었습니다!');
                router.push(`/blog/post/${result.data.slug}`);
            } else {
                setError(result.error || '게시글 수정에 실패했습니다.');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError('게시글 수정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }

    if (isCheckingAuth || isFetching) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-10">
                    {isCheckingAuth ? '로딩 중...' : '포스트를 불러오는 중...'}
                </div>
            </div>
        );
    }

    if (!userId) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">게시글 수정</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-sm">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-xl font-semibold mb-2">제목 *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    placeholder="게시글 제목을 입력하세요"
                />
            </div>

            <div className="mb-4">
                <label className="block text-xl font-semibold mb-2">설명 *</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    placeholder="게시글 설명 (SEO용)"
                />
            </div>

            <div className="mb-4">
                <label className="block text-xl font-semibold mb-2">태그</label>
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    placeholder="쉼표로 구분 (예: React, TypeScript, Next.js)"
                />
            </div>

            <div className="mb-4">
                <label className="block text-xl font-semibold mb-2">카테고리 *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                        <label
                            key={cat.id}
                            className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(cat.id)}
                                onChange={() => toggleCategory(cat.id)}
                                className="w-4 h-4"
                            />
                            <span>{cat.title}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-xl font-semibold mb-2">내용 *</label>
                <MDEditor value={content} onChange={(val) => setContent(val || '')} height={500} />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? '수정 중...' : '수정'}
                </button>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-500 text-white px-6 py-2 rounded-sm hover:bg-gray-600"
                >
                    취소
                </button>
            </div>
        </div>
    );
}
