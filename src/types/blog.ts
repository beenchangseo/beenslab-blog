export type PostStatus = 'DRAFT' | 'PUBLISHED';

export type PostSeries = {
    slug: string;
    title: string;
    order: number | null;
};

// 목록용 DTO는 클라이언트 컴포넌트로 통째로 내려가므로 최소한만 담는다.
// tags는 글 하나에 20개씩 붙어 있는 경우가 있어 목록에는 넣지 않는다.
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
