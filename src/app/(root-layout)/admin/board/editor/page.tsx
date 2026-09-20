'use client';

import MDEditor from '@uiw/react-md-editor';
import {useState, useEffect} from 'react';
import {createPost} from '@/app/actions/posts';
import {useRouter} from 'next/navigation';
import PostMetaFields from '@/components/admin/PostMetaFields';
import {GetSeriesResponseDto} from '@/types/blog';

interface Category {
    id: string;
    keyword: string;
    title: string;
}

export default function BoardEditorPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [seriesList, setSeriesList] = useState<GetSeriesResponseDto[]>([]);
    const [coverImage, setCoverImage] = useState('');
    const [seriesId, setSeriesId] = useState('');
    const [seriesOrder, setSeriesOrder] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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

    async function fetchOptions() {
        try {
            const [catRes, seriesRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/series'),
            ]);
            const cat = await catRes.json();
            const series = await seriesRes.json();
            if (cat.data) setCategories(cat.data);
            if (series.data) setSeriesList(series.data);
        } catch (err) {
            console.error('Failed to fetch editor options:', err);
            setError('카테고리/시리즈를 불러오는데 실패했습니다.');
        }
    }

    // 선언보다 먼저 호출하면 react-hooks/immutability 규칙에 걸린다.
    // set-state-in-effect는 오탐이다. fetchCategories는 await 뒤에 setState를 하므로
    // 이펙트 본문에서 동기적으로 상태를 바꾸지 않는다.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        fetchOptions();
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect */

    function toggleCategory(categoryId: string) {
        setSelectedCategoryIds((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId],
        );
    }

    async function handleSave(publish: boolean) {
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

            const result = await createPost({
                title,
                description,
                contents: content,
                tags: tagsArray,
                categoryIds: selectedCategoryIds,
                coverImage: coverImage.trim() || null,
                seriesId: seriesId || null,
                seriesOrder: seriesOrder ? Number(seriesOrder) : null,
                publish,
            });

            if (result.success && result.data) {
                if (publish) {
                    alert('게시글이 발행되었습니다.');
                    router.push(`/blog/post/${result.data.slug}`);
                } else {
                    // 초안은 공개 페이지에 없으므로 관리자 목록으로 돌아간다.
                    alert('초안으로 저장했습니다.');
                    router.push('/admin/blog');
                }
            } else {
                setError(result.error || '게시글 작성에 실패했습니다.');
            }
        } catch (err) {
            console.error('Publish error:', err);
            setError('게시글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }

    if (isCheckingAuth) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-10">로딩 중...</div>
            </div>
        );
    }

    if (!userId) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">게시글 작성</h1>

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

            <PostMetaFields
                coverImage={coverImage}
                setCoverImage={setCoverImage}
                seriesId={seriesId}
                setSeriesId={setSeriesId}
                seriesOrder={seriesOrder}
                setSeriesOrder={setSeriesOrder}
                seriesList={seriesList}
            />

            <div className="mb-4">
                <label className="block text-xl font-semibold mb-2">내용 *</label>
                <MDEditor value={content} onChange={(val) => setContent(val || '')} height={500} />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => handleSave(true)}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? '저장 중...' : '발행'}
                </button>
                <button
                    onClick={() => handleSave(false)}
                    disabled={isLoading}
                    className="border border-gray-400 px-6 py-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    초안 저장
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
