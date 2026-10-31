'use client';

import MDEditor from '@uiw/react-md-editor';
import {ReactNode, useState} from 'react';
import {useRouter} from 'next/navigation';
import {createPost, updatePost} from '@/app/actions/posts';
import {PostDraft, toPostInput, validateDraft} from '@/components/admin/postDraft';
import {GetCategoryResponseDto, GetSeriesResponseDto, PostStatus} from '@/types/blog';

type Target = {mode: 'create'} | {mode: 'edit'; postId: string; status: PostStatus};

type Props = {
    target: Target;
    initial: PostDraft;
    categories: GetCategoryResponseDto[];
    seriesList: GetSeriesResponseDto[];
};

const COPY = {
    create: {
        heading: '게시글 작성',
        draftButton: '초안 저장',
        published: '게시글이 발행되었습니다.',
        failed: '게시글 작성에 실패했습니다.',
        crashed: '게시글 작성 중 오류가 발생했습니다.',
    },
    edit: {
        heading: '게시글 수정',
        draftButton: '초안으로 저장',
        published: '게시글이 수정되었습니다.',
        failed: '게시글 수정에 실패했습니다.',
        crashed: '게시글 수정 중 오류가 발생했습니다.',
    },
} as const;

const inputClass =
    'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800';

function Field({id, label, children}: {id: string; label: string; children: ReactNode}) {
    return (
        <div className="mb-4">
            <label className="block text-xl font-semibold mb-2" htmlFor={id}>
                {label}
            </label>
            {children}
        </div>
    );
}

export default function PostEditor({target, initial, categories, seriesList}: Props) {
    const router = useRouter();
    const [draft, setDraft] = useState(initial);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const copy = COPY[target.mode];
    const isPublished = target.mode === 'edit' && target.status === 'PUBLISHED';

    function update<K extends keyof PostDraft>(field: K, value: PostDraft[K]) {
        setDraft((prev) => ({...prev, [field]: value}));
    }

    function toggleCategory(categoryId: string) {
        setDraft((prev) => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter((id) => id !== categoryId)
                : [...prev.categoryIds, categoryId],
        }));
    }

    async function save(publish: boolean) {
        const invalid = validateDraft(draft);
        if (invalid) {
            setError(invalid);
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const input = toPostInput(draft, publish);
            const result =
                target.mode === 'create'
                    ? await createPost(input)
                    : await updatePost({postId: target.postId, ...input});

            if (!result.success) {
                setError(result.error || copy.failed);
                return;
            }

            if (publish) {
                alert(copy.published);
                router.push(`/blog/post/${result.data.slug}`);
            } else {
                // Drafts are not on the public pages, so go back to the admin list.
                alert('초안으로 저장했습니다.');
                router.push('/admin/blog');
            }
        } catch (err) {
            console.error('Save post error:', err);
            setError(copy.crashed);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-3xl font-bold">{copy.heading}</h1>
                {target.mode === 'edit' && (
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${
                            isPublished
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                    >
                        {isPublished ? '발행됨' : '초안'}
                    </span>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-sm">
                    {error}
                </div>
            )}

            <Field id="post-title" label="제목 *">
                <input
                    id="post-title"
                    type="text"
                    value={draft.title}
                    onChange={(e) => update('title', e.target.value)}
                    className={inputClass}
                    placeholder="게시글 제목을 입력하세요"
                />
            </Field>

            <Field id="post-description" label="설명 *">
                <input
                    id="post-description"
                    type="text"
                    value={draft.description}
                    onChange={(e) => update('description', e.target.value)}
                    className={inputClass}
                    placeholder="게시글 설명 (SEO용)"
                />
            </Field>

            <Field id="post-tags" label="태그">
                <input
                    id="post-tags"
                    type="text"
                    value={draft.tags}
                    onChange={(e) => update('tags', e.target.value)}
                    className={inputClass}
                    placeholder="쉼표로 구분 (예: React, TypeScript, Next.js)"
                />
            </Field>

            <fieldset className="mb-4">
                <legend className="block text-xl font-semibold mb-2">카테고리 *</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                        <label
                            key={cat.id}
                            className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <input
                                type="checkbox"
                                checked={draft.categoryIds.includes(cat.id)}
                                onChange={() => toggleCategory(cat.id)}
                                className="w-4 h-4"
                            />
                            <span>{cat.title}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            <Field id="cover-image" label="커버 이미지">
                <input
                    id="cover-image"
                    type="text"
                    value={draft.coverImage}
                    onChange={(e) => update('coverImage', e.target.value)}
                    className={inputClass}
                    placeholder="/images/example/cover.png (비워두면 자동 생성 이미지를 쓴다)"
                />
            </Field>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
                <div>
                    <label className="block text-xl font-semibold mb-2" htmlFor="series">
                        시리즈
                    </label>
                    <select
                        id="series"
                        value={draft.seriesId}
                        onChange={(e) => update('seriesId', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">없음</option>
                        {seriesList.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xl font-semibold mb-2" htmlFor="series-order">
                        순서
                    </label>
                    <input
                        id="series-order"
                        type="number"
                        min={1}
                        value={draft.seriesOrder}
                        onChange={(e) => update('seriesOrder', e.target.value)}
                        disabled={!draft.seriesId}
                        className={`${inputClass} disabled:opacity-50`}
                        placeholder="1"
                    />
                </div>
            </div>

            <div className="mb-4">
                <p className="block text-xl font-semibold mb-2">내용 *</p>
                <MDEditor
                    value={draft.contents}
                    onChange={(value) => update('contents', value || '')}
                    height={500}
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => save(true)}
                    disabled={isSaving}
                    className="bg-blue-500 text-white px-6 py-2 rounded-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? '저장 중...' : isPublished ? '수정' : '발행'}
                </button>
                <button
                    onClick={() => save(false)}
                    disabled={isSaving}
                    className="border border-gray-400 px-6 py-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {copy.draftButton}
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
