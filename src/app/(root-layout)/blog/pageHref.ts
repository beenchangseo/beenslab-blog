// 1페이지는 /blog, 그 뒤는 /blog/page/2 형태다. 두 곳(목록과 페이지네이션)이
// 같은 규칙을 써야 해서 한 곳에 둔다.
export function blogPageHref(page: number): string {
    return page <= 1 ? '/blog' : `/blog/page/${page}`;
}
