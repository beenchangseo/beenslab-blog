import {Metadata} from 'next';
import Link from 'next/link';
import {getCategories, searchPosts} from '@/lib/posts';
import Container from '@/components/layout/Container';
import PostGrid from '@/components/blog/PostGrid';
import SearchForm from '@/components/blog/SearchForm';
import Pagination from '@/components/blog/Pagination';

// 검색 결과는 질의마다 달라서 정적으로 만들 수 없다. 목록(/blog)은 그대로
// 정적으로 남겨두려고 검색만 별도 경로로 뺐다.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '검색 - ChangBeen Seo',
    description: '블로그 글을 제목, 설명, 본문에서 찾습니다.',
    // 검색 결과 페이지는 색인 대상이 아니다.
    robots: {index: false, follow: true},
};

export default async function SearchPage(props: {
    searchParams: Promise<{q?: string; page?: string}>;
}) {
    const {q = '', page = '1'} = await props.searchParams;
    const query = q.trim();
    const current = Math.max(1, Number(page) || 1);

    const [result, categories] = await Promise.all([searchPosts(query, current), getCategories()]);

    return (
        <Container className="py-12 sm:py-16">
            <header className="mb-8">
                <h1 className="mb-6 text-3xl font-bold sm:text-4xl">검색</h1>
                <SearchForm initialQuery={query} />
            </header>

            {!query ? (
                <p className="py-16 text-center text-ink-muted">찾을 말을 입력해 주세요.</p>
            ) : result.total === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-ink-muted">&lsquo;{query}&rsquo;에 대한 결과가 없습니다.</p>
                    <Link
                        href="/blog"
                        className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
                    >
                        전체 글 보기 →
                    </Link>
                </div>
            ) : (
                <>
                    <p className="mb-8 text-sm text-ink-muted">
                        &lsquo;{query}&rsquo; 검색 결과 {result.total}건
                    </p>
                    <PostGrid posts={result.posts} categories={categories} />
                    <Pagination
                        current={current}
                        totalPages={result.totalPages}
                        hrefFor={(n) =>
                            `/search?q=${encodeURIComponent(query)}${n > 1 ? `&page=${n}` : ''}`
                        }
                    />
                </>
            )}
        </Container>
    );
}
