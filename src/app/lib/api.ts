type GenericResponse<T> = {
    data: T;
};

export type GetAllBlogPostResponseDto = {
    id: string;
    slug: string;
    title: string;
    description: string;
    categories: string[];
    update_time: string;
    create_time: string;
};

export type GetBlogPostResponseDto = {
    user_id: string;
    slug: string;
    title: string;
    description: string;
    tags: string[];
    categories: string[];
    contents: string;
    update_time: string;
    create_time: string;
};

export type GetCategoryResponseDto = {
    id: string;
    title: string;
    keyword: string;
};

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return '';
    }
    return process.env.APP_URL || 'http://localhost:7777';
};

export async function fetchPost(slug: string): Promise<GenericResponse<GetBlogPostResponseDto>> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/blog/posts/${slug}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch post');

    return res.json();
}

export async function fetchAllPosts(): Promise<GenericResponse<GetAllBlogPostResponseDto[]>> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/blog/posts`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch posts');

    return res.json();
}

export async function fetchCategories(): Promise<GenericResponse<GetCategoryResponseDto[]>> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/categories`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch categories');

    return res.json();
}
