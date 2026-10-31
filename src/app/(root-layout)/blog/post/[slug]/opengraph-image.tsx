import {COVER_SIZE, renderPostCover} from '@/lib/postCover';

export const alt = '게시글 커버';
export const size = COVER_SIZE;
export const contentType = 'image/png';

export default async function PostOpenGraphImage(props: {params: Promise<{slug: string}>}) {
    const {slug} = await props.params;
    return renderPostCover(slug);
}
