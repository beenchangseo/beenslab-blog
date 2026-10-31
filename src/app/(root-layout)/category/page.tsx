import {pageMetadata} from '@/lib/metadata';
import Link from 'next/link';
import {getAllPosts, getCategories} from '@/lib/posts';
import Container from '@/components/layout/Container';

export const revalidate = 3600;

export const metadata = pageMetadata({
    title: '카테고리 - ChangBeen Seo',
    description: 'Backend, Database, Infra 등 주제별로 분류된 블로그 포스트를 탐색하세요.',
    shareDescription: '주제별로 분류된 블로그 포스트',
    path: '/category',
    imageAlt: 'Beenchangseo Blog Categories',
});

export default async function CategoryIndexPage() {
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
