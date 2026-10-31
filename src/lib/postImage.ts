import {postPath} from '@/lib/paths';
import {PostSummary} from '@/types/blog';

export function getPostThumbnail(post: Pick<PostSummary, 'slug' | 'cover_image'>): string {
    return post.cover_image ?? `${postPath(post.slug)}/cover`;
}
