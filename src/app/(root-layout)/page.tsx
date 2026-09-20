import {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {getAllPosts, getCategories} from '@/lib/posts';
import Container from '@/components/layout/Container';
import PostGrid from '@/components/blog/PostGrid';
import {getPostThumbnail} from '@/lib/postImage';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'ChangBeen Seo - 백엔드 개발자',
    description:
        '더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다. 기술과 경험을 나누는 개발자 서창빈의 블로그입니다.',
    keywords: ['백엔드 개발자', 'Node.js', 'TypeScript', 'AWS', 'DevOps', '서창빈', 'beenchangseo'],
    openGraph: {
        title: 'ChangBeen Seo - 백엔드 개발자',
        description: '더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다.',
        url: 'https://blog.beenslab.com/',
        siteName: 'Beenchangseo Blog',
        locale: 'ko_KR',
        type: 'website',
        images: [{url: '/opengraph-image', width: 1200, height: 630, alt: 'ChangBeen Seo Blog'}],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ChangBeen Seo - 백엔드 개발자',
        description: '더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다.',
        creator: '@beenchangseo',
        images: ['/twitter-image'],
    },
    alternates: {
        canonical: 'https://blog.beenslab.com/',
    },
};

export default async function Home() {
    const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);

    const latest = posts.slice(0, 6);
    // 글이 19개뿐이라 메모리에서 정렬한다. 많아지면 쿼리로 옮길 것.
    const popular = [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 3);

    // 시리즈별로 묶어 편 순서대로 세운다.
    const seriesMap = new Map<string, {title: string; posts: typeof posts}>();
    for (const post of posts) {
        if (!post.series) continue;
        const entry = seriesMap.get(post.series.slug) ?? {title: post.series.title, posts: []};
        entry.posts.push(post);
        seriesMap.set(post.series.slug, entry);
    }
    const seriesList = [...seriesMap.values()].map((s) => ({
        ...s,
        posts: [...s.posts].sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0)),
    }));

    return (
        <>
            <Container className="py-14 sm:py-20">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-8 sm:text-left">
                    <Image
                        src="/images/profile.jpeg"
                        alt="서창빈 프로필 사진"
                        width={96}
                        height={96}
                        priority
                        className="size-24 shrink-0 rounded-full object-cover shadow-md"
                    />
                    <div>
                        <h1 className="text-3xl font-bold sm:text-4xl">ChangBeen Seo</h1>
                        <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
                            더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다. 실제
                            운영에서 겪은 성능 문제와 장애 대응을 기록합니다.
                        </p>
                    </div>
                </div>
            </Container>

            <Container className="pb-16">
                <SectionHeading title="최신 글" href="/blog" linkLabel="전체 보기" />
                <PostGrid posts={latest} categories={categories} />
            </Container>

            {popular.some((post) => post.view_count > 0) && (
                <section className="bg-surface-subtle py-16">
                    <Container>
                        <SectionHeading title="많이 본 글" />
                        <ol className="flex flex-col gap-1">
                            {popular.map((post, index) => (
                                <li key={post.id}>
                                    <Link
                                        href={`/blog/post/${post.slug}`}
                                        className="flex items-baseline gap-4 rounded-lg px-3 py-4 transition-colors hover:bg-surface focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                                    >
                                        <span className="text-xl font-bold tabular-nums text-brand-500">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1">
                                            <span className="block font-semibold">
                                                {post.title}
                                            </span>
                                            <span className="mt-1 line-clamp-1 block text-sm text-ink-muted">
                                                {post.description}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </Container>
                </section>
            )}

            {seriesList.length > 0 && (
                <Container className="py-16">
                    <SectionHeading title="시리즈" />
                    <div className="flex flex-col gap-8">
                        {seriesList.map((series) => (
                            <div
                                key={series.title}
                                className="rounded-2xl border border-line p-6 sm:p-8"
                            >
                                <h3 className="text-xl font-bold">{series.title}</h3>
                                <ol className="mt-5 grid gap-5 sm:grid-cols-2">
                                    {series.posts.map((post) => (
                                        <li key={post.id} className="flex gap-4">
                                            <Link
                                                href={`/blog/post/${post.slug}`}
                                                className="shrink-0 overflow-hidden rounded-lg border border-line focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                                            >
                                                <Image
                                                    src={getPostThumbnail(post)}
                                                    alt=""
                                                    width={1200}
                                                    height={630}
                                                    sizes="128px"
                                                    className="aspect-[1200/630] w-32 object-cover"
                                                />
                                            </Link>
                                            <div className="min-w-0">
                                                <p className="text-xs text-ink-muted">
                                                    {post.series?.order}편
                                                </p>
                                                <Link
                                                    href={`/blog/post/${post.slug}`}
                                                    className="mt-1 line-clamp-2 block font-semibold hover:text-brand-600"
                                                >
                                                    {post.title}
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </Container>
            )}
        </>
    );
}

function SectionHeading({
    title,
    href,
    linkLabel,
}: {
    title: string;
    href?: string;
    linkLabel?: string;
}) {
    return (
        <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            {href && linkLabel && (
                <Link href={href} className="text-sm font-semibold text-brand-600 hover:underline">
                    {linkLabel} →
                </Link>
            )}
        </div>
    );
}
