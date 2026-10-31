import {ImageResponse} from 'next/og';
import {getCategories, getPostBySlug} from '@/lib/posts';
import {AUTHOR_NAME, SITE_HOST} from '@/lib/site';

export const COVER_SIZE = {width: 1200, height: 630};

export async function renderPostCover(slug: string) {
    const [post, categories] = await Promise.all([getPostBySlug(slug), getCategories()]);

    const title = post?.title ?? 'Beenslab Blog';
    const categoryTitle = post
        ? categories.find((c) => c.keyword === post.categories[0])?.title ?? ''
        : '';

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
                    <div style={{display: 'flex'}}>{SITE_HOST}</div>
                    <div style={{display: 'flex'}}>{AUTHOR_NAME}</div>
                </div>
            </div>
        ),
        {...COVER_SIZE},
    );
}
