import {Mdx} from '../../../../../components/Mdx';
import {getAllPosts, getCategories, getPostBySlug} from '@/lib/posts';
import Link from 'next/link';
import Image from 'next/image';
import {Metadata} from 'next';
import Script from 'next/script';
import {notFound} from 'next/navigation';

export const revalidate = 3600;

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.filter((post) => post.slug).map((post) => ({slug: post.slug}));
}

export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);
    if (!post) {
        notFound();
    }
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
            images: [{url: '/opengraph-image', width: 1200, height: 630, alt: post.title}],
            publishedTime: post.create_time,
            modifiedTime: post.update_time,
            authors: ['ChangBeen Seo'],
            tags: post.tags,
        },
        twitter: {
            card: 'summary_large_image',
            images: ['/twitter-image'],
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

export default async function PostPage({params}: {params: {slug: string}}) {
    const post = await getPostBySlug(params.slug);
    if (!post) {
        notFound();
    }
    const categories = await getCategories();

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
        datePublished: post.create_time,
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

    // 링크를 button으로 감싸면 유효하지 않은 HTML이라 Link 자체에 스타일을 준다.
    // prose가 a에 밑줄을 넣으므로 no-underline으로 되돌린다.
    const categoryLinkStyle =
        'inline-flex h-8 items-center px-3 m-1 text-xs no-underline font-medium text-inherit border-2 border-gray-700 dark:border-gray-300 rounded-lg transition-colors duration-150 hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111111]';

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
            <section>
                <div className="mt-10 pb-10 border-b-2 mb-10 prose dark:prose-invert">
                    {/* 제목은 대부분 한글이다. font-mono를 두면 공백/문장부호만 등폭으로
                        잡혀 글자 사이가 들쭉날쭉해지므로 본문과 같은 폰트를 쓴다. */}
                    <h1 className="mb-8 font-bold text-2xl sm:text-4xl">{post.title}</h1>
                    <div className="flex-auto mb-4">
                        {post.categories.map((item: string, index: number) => {
                            const category = categories.find(
                                (category: any) => category.keyword === item,
                            );
                            return (
                                <Link
                                    className={categoryLinkStyle}
                                    key={index}
                                    href={{pathname: '/category', query: {filter: item}}}
                                >
                                    {category ? category.title : item}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-between mb-16">
                        <span className="text-sm">
                            <Link href="/">beenchangseo</Link>
                        </span>
                        <span className="ml-1 mr-1">·</span>
                        <time
                            className="text-sm font-medium text-gray-500"
                            dateTime={post.create_time}
                        >
                            {formatDate(post.create_time.toString())}
                        </time>
                        <span className="flex items-center ml-auto">
                            {/* 조회수 배지. 링크가 아니므로 a로 감싸지 않는다. */}
                            <Image
                                className="mb-0 mt-0"
                                src={`/api/blog/count?post_id=${params.slug}&domain=blog.beenslab.com`}
                                alt="조회수"
                                width={200}
                                height={20}
                                unoptimized
                            />
                        </span>
                    </div>
                    <Mdx markdown={post.contents} />
                </div>
            </section>
        </>
    );
}
