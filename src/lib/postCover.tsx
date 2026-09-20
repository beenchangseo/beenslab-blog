import {ImageResponse} from 'next/og';
import {getCategories, getPostBySlug} from '@/lib/posts';

export const COVER_SIZE = {width: 1200, height: 630};

// 글 제목이 들어간 커버 이미지를 만든다. 두 군데서 쓴다.
//   - opengraph-image.tsx: 공유용 OG 이미지 (URL에 빌드 해시가 붙어 불안정)
//   - cover/route.ts:      목록 카드 썸네일 (주소가 고정이라 링크할 수 있다)
// 같은 그림을 쓰므로 카드와 공유 미리보기가 어긋나지 않는다.
export async function renderPostCover(slug: string) {
    const [post, categories] = await Promise.all([getPostBySlug(slug), getCategories()]);

    const title = post?.title ?? 'Beenslab Blog';
    const categoryTitle = post
        ? categories.find((c) => c.keyword === post.categories[0])?.title ?? ''
        : '';

    // 제목이 길수록 글자를 줄여야 630px 안에 들어간다.
    const fontSize = title.length > 46 ? 56 : title.length > 28 ? 68 : 80;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 72,
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #1e3a8a 100%)',
                    color: '#ffffff',
                }}
            >
                <div style={{display: 'flex'}}>
                    {categoryTitle ? (
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 28,
                                padding: '10px 24px',
                                borderRadius: 999,
                                border: '2px solid rgba(255,255,255,0.35)',
                                color: 'rgba(255,255,255,0.92)',
                            }}
                        >
                            {categoryTitle}
                        </div>
                    ) : null}
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize,
                        fontWeight: 700,
                        lineHeight: 1.25,
                        // 4줄을 넘기면 잘라서 레이아웃이 깨지지 않게 한다.
                        maxHeight: 4 * fontSize * 1.25,
                        overflow: 'hidden',
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 30,
                        color: 'rgba(255,255,255,0.75)',
                    }}
                >
                    <div style={{display: 'flex'}}>blog.beenslab.com</div>
                    <div style={{display: 'flex'}}>ChangBeen Seo</div>
                </div>
            </div>
        ),
        {...COVER_SIZE},
    );
}
