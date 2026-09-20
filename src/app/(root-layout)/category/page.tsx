import {Metadata} from 'next';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAllPosts, getCategories} from '@/lib/posts';
import Container from '@/components/layout/Container';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: '카테고리 - ChangBeen Seo',
    description: 'Backend, Database, Infra 등 주제별로 분류된 블로그 포스트를 탐색하세요.',
    openGraph: {
        title: '카테고리 - ChangBeen Seo',
        description: '주제별로 분류된 블로그 포스트',
        url: 'https://blog.beenslab.com/category',
        siteName: 'Beenchangseo Blog',
        locale: 'ko_KR',
        type: 'website',
        images: [
            {
                url: '/opengraph-image',
                width: 1200,
                height: 630,
                alt: 'Beenchangseo Blog Categories',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '카테고리 - ChangBeen Seo',
        description: '주제별로 분류된 블로그 포스트',
        creator: '@beenchangseo',
        images: ['/twitter-image'],
    },
    alternates: {canonical: 'https://blog.beenslab.com/category'},
};

export default async function CategoryIndexPage(props: {searchParams: Promise<{filter?: string}>}) {
    // 예전 링크(/category?filter=backend)를 새 경로로 넘긴다.
    const {filter} = await props.searchParams;
    if (filter) {
        redirect(`/category/${filter}`);
    }

    const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);

    return (
        <Container className="py-12 sm:py-16">
            <header className="mb-10">
                <h1 className="text-3xl font-bold sm:text-4xl">카테고리</h1>
            </header>
            <ul className="grid gap-4 sm:grid-cols-2">
                {categories.map((category) => {
                    const count = posts.filter((post) =>
                        post.categories.includes(category.keyword),
                    ).length;
                    return (
                        <li key={category.id}>
                            <Link
                                href={`/category/${category.keyword}`}
                                className="flex items-baseline justify-between rounded-xl border border-line px-6 py-5 transition-colors hover:border-brand-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                            >
                                <span className="text-lg font-semibold">{category.title}</span>
                                <span className="text-sm text-ink-muted">{count}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </Container>
    );
}
