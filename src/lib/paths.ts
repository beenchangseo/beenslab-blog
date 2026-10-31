// Every in-app URL is built here, so a route change is one edit.
export function postPath(slug: string): string {
    return `/blog/post/${slug}`;
}

export function categoryPath(keyword: string): string {
    return `/category/${keyword}`;
}

// Page 1 of the list is /blog; later pages are /blog/page/<n>.
export function blogPagePath(page: number): string {
    return page <= 1 ? '/blog' : `/blog/page/${page}`;
}
