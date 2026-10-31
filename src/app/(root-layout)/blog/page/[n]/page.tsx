import {Metadata} from 'next';
import {pageMetadata} from '@/lib/metadata';
import {notFound} from 'next/navigation';
import {getCategories, getPostPage, getPublishedPostCount, pageCount} from '@/lib/posts';
import Container from '@/components/layout/Container';
import PostGrid from '@/components/blog/PostGrid';
import SearchForm from '@/components/blog/SearchForm';
import Pagination from '@/components/blog/Pagination';
import {blogPageHref} from '../../pageHref';

export const revalidate = 3600;

// 2페이지부터만 여기서 만든다. 1페이지는 /blog가 맡는다.
export async function generateStaticParams() {
    const totalPages = pageCount(await getPublishedPostCount());

    return Array.from({length: Math.max(0, totalPages - 1)}, (_, i) => ({n: String(i + 2)}));
}

export async function generateMetadata(props: {params: Promise<{n: string}>}): Promise<Metadata> {
    const {n} = await props.params;
    return pageMetadata({
        title: `블로그 ${n}페이지 - ChangBeen Seo`,
        description: '백엔드, 데이터베이스, 인프라에서 겪은 것들을 기록합니다.',
        path: `/blog/page/${n}`,
    });
}

export default async function BlogPaged(props: {params: Promise<{n: string}>}) {
    const {n} = await props.params;
    const current = Number(n);

    // 1페이지는 /blog가 정본이다. 중복 주소를 만들지 않는다.
    if (!Number.isInteger(current) || current < 2) {
        notFound();
    }

    const [result, categories] = await Promise.all([getPostPage(current), getCategories()]);

    if (result.posts.length === 0) {
        notFound();
    }

    return (
        <Container className="py-12 sm:py-16">
            <header className="mb-10">
                <h1 className="text-3xl font-bold sm:text-4xl">글</h1>
                <p className="mt-2 mb-6 text-ink-muted">
                    {current}페이지 · 전체 {result.total}건
                </p>
                <SearchForm />
            </header>
            <PostGrid posts={result.posts} categories={categories} />
            <Pagination current={current} totalPages={result.totalPages} hrefFor={blogPageHref} />
        </Container>
    );
}
