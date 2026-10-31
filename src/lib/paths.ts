export function postPath(slug: string): string {
    return `/blog/post/${slug}`;
}

export function categoryPath(keyword: string): string {
    return `/category/${keyword}`;
}

export function blogPagePath(page: number): string {
    return page <= 1 ? '/blog' : `/blog/page/${page}`;
}
