import {renderPostCover} from '@/lib/postCover';

// 목록 카드 썸네일용 고정 주소. opengraph-image.tsx는 빌드 해시가 붙은
// 주소로 노출돼서 코드에서 링크할 수 없기 때문에 따로 둔다.
export const revalidate = 3600;

export async function GET(request: Request, props: {params: Promise<{slug: string}>}) {
    const {slug} = await props.params;
    return renderPostCover(slug);
}
