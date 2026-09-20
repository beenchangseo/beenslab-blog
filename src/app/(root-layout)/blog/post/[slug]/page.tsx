import {Mdx} from '../../../../../components/Mdx';
import {getAllPosts, getCategories, getPostBySlug, getSlugRedirect} from '@/lib/posts';
import Container from '@/components/layout/Container';
import TableOfContents from '@/components/blog/TableOfContents';
import ShareButtons from '@/components/blog/ShareButtons';
import PostCard from '@/components/blog/PostCard';
import Comments from '@/components/blog/Comments';
import {extractHeadings} from '@/lib/toc';
import Link from 'next/link';
import Image from 'next/image';
import {Metadata} from 'next';
import Script from 'next/script';
import {notFound, permanentRedirect} from 'next/navigation';

export const revalidate = 3600;

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.filter((post) => post.slug).map((post) => ({slug: post.slug}));
}

// generateMetadata와 페이지 본문이 둘 다 글을 찾으므로 한 곳에 모은다.
// 제목을 바꾸면 slug가 새로 생성돼 옛 주소가 깨지는데, 그때는 404 대신
// 현재 주소로 308을 내보낸다.
async function resolvePost(slug: string) {
    const post = await getPostBySlug(slug);
    if (post) {
        return post;
    }

    const currentSlug = await getSlugRedirect(slug);
    if (currentSlug) {
        permanentRedirect(`/blog/post/${currentSlug}`);
    }

    notFound();
}

export async function generateMetadata(props: {
    params: Promise<{slug: string}>;
}): Promise<Metadata> {
    const params = await props.params;
    const post = await resolvePost(params.slug);
    const url = `https://blog.beenslab.com/blog/post/${params.slug}`;
    return {
        title: post.title,
        description: post.description,
        // keywords: post.tags,
        openGraph: {
            title: post.title,
            siteName: 'beenslab',
            description: post.description,
            url,
            type: 'article',
            publishedTime: post.published_at ?? post.create_time,
            modifiedTime: post.update_time,
            authors: ['ChangBeen Seo'],
            tags: post.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            creator: '@beenchangseo',
        },
        alternates: {
            canonical: url,
        },
        robots: {index: true, follow: true},
    };
}

export default async function PostPage(props: {params: Promise<{slug: string}>}) {
    const params = await props.params;
    const post = await resolvePost(params.slug);
    const categories = await getCategories();
    // 공개 시각이 곧 독자에게 보여줄 날짜다. 없으면 작성 시각으로 떨어진다.
    const publishedAt = post.published_at ?? post.create_time;

    // 같은 시리즈의 앞뒤 편. getAllPosts는 React.cache라 추가 쿼리가 아니다.
    const siblings = post.series
        ? (await getAllPosts())
              .filter((p) => p.series?.slug === post.series?.slug)
              .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
        : [];
    const index = siblings.findIndex((p) => p.slug === post.slug);
    const prev = index > 0 ? siblings[index - 1] : null;
    const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

    const headings = extractHeadings(post.contents);
    const postUrl = `https://blog.beenslab.com/blog/post/${params.slug}`;

    // 같은 카테고리의 다른 글. 한 편 읽고 그대로 떠나지 않게 이어 붙인다.
    const allPosts = await getAllPosts();
    const related = allPosts
        .filter(
            (p) =>
                p.slug !== post.slug &&
                p.categories.some((keyword) => post.categories.includes(keyword)),
        )
        .slice(0, 3);

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://blog.beenslab.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://blog.beenslab.com/blog',
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://blog.beenslab.com/blog/post/${params.slug}`,
            },
        ],
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://blog.beenslab.com/blog/post/${params.slug}`,
        },
        headline: post.title,
        description: post.description,
        articleBody: post.contents.substring(0, 500),
        keywords: post.tags.join(', '),
        author: {
            '@type': 'Person',
            name: 'ChangBeen Seo',
            url: 'https://blog.beenslab.com',
        },
        publisher: {
            '@type': 'Organization',
            name: 'beenslab',
            url: 'https://blog.beenslab.com',
            logo: {
                '@type': 'ImageObject',
                url: 'https://blog.beenslab.com/apple-icon',
            },
        },
        datePublished: publishedAt,
        dateModified: post.update_time,
        image: 'https://blog.beenslab.com/opengraph-image',
        inLanguage: 'ko',
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <>
            <Script
                id="breadcrumb-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbJsonLd)}}
            />
            <Script
                id="post-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
            />
            <Container width="reading" className="py-10 sm:py-14">
                <article>
                    <header className="mb-10">
                        <div className="mb-4 flex flex-wrap gap-2">
                            {post.categories.map((item: string) => {
                                const category = categories.find((c) => c.keyword === item);
                                return (
                                    <Link
                                        key={item}
                                        href={`/category/${item}`}
                                        className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                                    >
                                        {category ? category.title : item}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* 제목은 대부분 한글이다. font-mono를 두면 공백/문장부호만 등폭으로
                            잡혀 글자 사이가 들쭉날쭉해지므로 본문과 같은 폰트를 쓴다. */}
                        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                            {post.title}
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
                            {post.description}
                        </p>

                        <div className="mt-6 flex items-center gap-3 text-sm text-ink-muted">
                            <span>ChangBeen Seo</span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
                            <span className="ml-auto flex items-center">
                                {/* 조회수 배지. 링크가 아니므로 a로 감싸지 않는다. */}
                                <Image
                                    src={`/api/blog/count?post_id=${params.slug}&domain=blog.beenslab.com`}
                                    alt="조회수"
                                    width={200}
                                    height={20}
                                    unoptimized
                                />
                            </span>
                        </div>

                        {post.series && (
                            <p className="mt-6 rounded-xl border border-line px-4 py-3 text-sm">
                                <span className="text-ink-muted">시리즈</span>{' '}
                                <span className="font-semibold">{post.series.title}</span>
                                {post.series.order != null && (
                                    <span className="text-ink-muted"> · {post.series.order}편</span>
                                )}
                            </p>
                        )}
                    </header>

                    {/* 자동 생성 커버는 제목을 그대로 그린 그림이라, 바로 위
                        h1과 겹쳐 보인다. 직접 지정한 커버가 있을 때만 띄운다. */}
                    {post.cover_image && (
                        <Image
                            src={post.cover_image}
                            alt=""
                            width={1200}
                            height={630}
                            priority
                            sizes="(max-width: 768px) 100vw, 736px"
                            className="mb-12 aspect-[1200/630] w-full rounded-2xl border border-line object-cover"
                        />
                    )}

                    <div className="prose dark:prose-invert max-w-none">
                        <Mdx markdown={post.contents} />
                    </div>

                    <div className="mt-12 border-t border-line pt-8">
                        <ShareButtons url={postUrl} title={post.title} />
                    </div>
                </article>

                <TableOfContents headings={headings} />

                {(prev || next) && (
                    <nav
                        aria-label="시리즈 이동"
                        className="mt-14 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
                    >
                        {prev ? (
                            <Link
                                href={`/blog/post/${prev.slug}`}
                                className="rounded-xl border border-line px-5 py-4 transition-colors hover:border-brand-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                            >
                                <span className="text-xs text-ink-muted">← 이전 편</span>
                                <span className="mt-1 block font-semibold">{prev.title}</span>
                            </Link>
                        ) : (
                            <span />
                        )}
                        {next && (
                            <Link
                                href={`/blog/post/${next.slug}`}
                                className="rounded-xl border border-line px-5 py-4 text-right transition-colors hover:border-brand-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 sm:col-start-2"
                            >
                                <span className="text-xs text-ink-muted">다음 편 →</span>
                                <span className="mt-1 block font-semibold">{next.title}</span>
                            </Link>
                        )}
                    </nav>
                )}

                <Comments />

                {related.length > 0 && (
                    <section className="mt-16 border-t border-line pt-10">
                        <h2 className="mb-8 text-xl font-bold">함께 읽으면 좋은 글</h2>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
                            {related.map((item) => (
                                <PostCard key={item.id} post={item} categories={categories} />
                            ))}
                        </div>
                    </section>
                )}
            </Container>
        </>
    );
}
