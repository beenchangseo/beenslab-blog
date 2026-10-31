import {renderPostCover} from '@/lib/postCover';

// Next serves opengraph-image.tsx under a route-group hash suffix
// (opengraph-image-<hash>), so list thumbnails link to this fixed path instead.
export const revalidate = 3600;

export async function GET(request: Request, props: {params: Promise<{slug: string}>}) {
    const {slug} = await props.params;
    return renderPostCover(slug);
}
