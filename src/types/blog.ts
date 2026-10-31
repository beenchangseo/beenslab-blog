export type PostStatus = 'DRAFT' | 'PUBLISHED';

export type PostSeries = {
    slug: string;
    title: string;
    order: number | null;
};

export type PostSummary = {
    id: string;
    slug: string;
    title: string;
    description: string;
    cover_image: string | null;
    categories: string[];
    status: PostStatus;
    published_at: string | null;
    view_count: number;
    series: PostSeries | null;
    update_time: string;
    create_time: string;
};

export type PostDetail = PostSummary & {
    user_id: string;
    tags: string[];
    contents: string;
};

export type Category = {
    id: string;
    title: string;
    keyword: string;
};

export type Series = {
    id: string;
    slug: string;
    title: string;
    description: string | null;
};
