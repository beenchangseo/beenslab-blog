import type {CreatePostInput} from '@/app/actions/posts';
import type {PostDetail, Category, Series} from '@/types/blog';

// What the editor form holds while typing. Kept apart from PostEditor because that
// file is a client module, and the server pages that build the initial draft cannot
// import values from it.
export type PostDraft = {
    title: string;
    description: string;
    tags: string;
    contents: string;
    categoryIds: string[];
    coverImage: string;
    seriesId: string;
    seriesOrder: string;
};

export const EMPTY_DRAFT: PostDraft = {
    title: '',
    description: '',
    tags: '',
    contents: '',
    categoryIds: [],
    coverImage: '',
    seriesId: '',
    seriesOrder: '',
};

// Posts reference categories by keyword and series by slug, but the actions take ids.
export function draftFromPost(
    post: PostDetail,
    categories: Category[],
    seriesList: Series[],
): PostDraft {
    const categoryIdByKeyword = new Map(categories.map((c) => [c.keyword, c.id]));

    return {
        title: post.title,
        description: post.description,
        tags: post.tags.join(', '),
        contents: post.contents,
        categoryIds: post.categories.flatMap((keyword) => categoryIdByKeyword.get(keyword) ?? []),
        coverImage: post.cover_image ?? '',
        seriesId: seriesList.find((s) => s.slug === post.series?.slug)?.id ?? '',
        seriesOrder: post.series?.order != null ? String(post.series.order) : '',
    };
}

export function validateDraft(draft: PostDraft): string | null {
    if (!draft.title.trim()) return '제목을 입력해주세요.';
    if (!draft.description.trim()) return '설명을 입력해주세요.';
    if (!draft.contents.trim()) return '내용을 입력해주세요.';
    if (draft.categoryIds.length === 0) return '최소 하나의 카테고리를 선택해주세요.';
    return null;
}

export function toPostInput(draft: PostDraft, publish: boolean): CreatePostInput {
    return {
        title: draft.title,
        description: draft.description,
        contents: draft.contents,
        tags: draft.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
        categoryIds: draft.categoryIds,
        coverImage: draft.coverImage.trim() || null,
        seriesId: draft.seriesId || null,
        seriesOrder: draft.seriesOrder ? Number(draft.seriesOrder) : null,
        publish,
    };
}
