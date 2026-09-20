import {GetAllBlogPostResponseDto} from '@/types/blog';

// cover_image를 지정하지 않은 글은 제목으로 만든 커버를 쓴다.
// 공유용 OG와 같은 그림이라 카드와 미리보기가 어긋나지 않는다.
export function getPostThumbnail(
    post: Pick<GetAllBlogPostResponseDto, 'slug' | 'cover_image'>,
): string {
    return post.cover_image ?? `/blog/post/${post.slug}/cover`;
}
