export const SITE_HOST = 'blog.beenslab.com';
export const SITE_URL = `https://${SITE_HOST}`;
export const SITE_NAME = 'Beenchangseo Blog';
export const AUTHOR_NAME = 'ChangBeen Seo';
export const TWITTER_HANDLE = '@beenchangseo';

export function absoluteUrl(path: string): string {
    return `${SITE_URL}${path}`;
}
