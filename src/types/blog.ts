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
    id: string;
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
