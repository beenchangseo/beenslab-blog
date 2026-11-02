import {pageMetadata} from '@/lib/metadata';
import Image from 'next/image';
import Link from 'next/link';
import {getAllPosts, getCategories} from '@/lib/posts';
import Container from '@/components/layout/Container';
import {categoryPath, postPath} from '@/lib/paths';
import {formatPostDate} from '@/lib/date';
import {Category, PostSummary} from '@/types/blog';

export const revalidate = 3600;

const MOTTO = '데이터를 안전하고 정확하게 전달하는 백엔드 개발자가 되자!';

export const metadata = pageMetadata({
    title: 'ChangBeen Seo - 백엔드 개발자',
    description: `${MOTTO} 백엔드 엔지니어 서창빈의 기술 블로그입니다.`,
    shareDescription: MOTTO,
    path: '/',
    keywords: ['백엔드 개발자', 'Node.js', 'TypeScript', 'AWS', 'DevOps', '서창빈', 'beenchangseo'],
    imageAlt: 'ChangBeen Seo Blog',
});

const RECENT_COUNT = 6;

export default async function Home() {
    const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);

    const [featured, ...rest] = posts;
    const recent = rest.slice(0, RECENT_COUNT);
    const categoryCounts = categories
        .map((category) => ({
            ...category,
            count: posts.filter((post) => post.categories.includes(category.keyword)).length,
        }))
        .filter((category) => category.count > 0);

    return (
        <Container className="break-keep">
            <section className="flex items-center gap-5 border-b border-line pt-14 pb-12 sm:gap-6 sm:pt-16">
                <Image
                    src="/images/profile.jpeg"
                    alt="서창빈 프로필 사진"
                    width={72}
                    height={72}
                    priority
                    className="size-16 shrink-0 rounded-full object-cover sm:size-18"
                />
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">서창빈</h1>
                    <p className="mt-1 text-ink-muted sm:text-lg">{MOTTO}</p>
                </div>
            </section>

            {featured && (
                <section className="grid gap-12 border-b border-line py-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
                    <article>
                        <Kicker post={featured} categories={categories} />
                        <h2 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                            <Link href={postPath(featured.slug)} className="hover:text-brand-600">
                                {featured.title}
                            </Link>
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
                            {featured.description}
                        </p>
                        <Link
                            href={postPath(featured.slug)}
                            className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline"
                        >
                            글 읽기 →
                        </Link>
                    </article>

                    <aside>
                        <h2 className="text-sm font-bold">카테고리</h2>
                        <ul className="mt-2">
                            {categoryCounts.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        href={categoryPath(category.keyword)}
                                        className="flex justify-between border-b border-line py-3 hover:text-brand-600"
                                    >
                                        {category.title}
                                        <span className="text-ink-muted tabular-nums">
                                            {category.count}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </section>
            )}

            <section className="grid sm:grid-cols-2">
                {recent.map((post) => (
                    <article
                        key={post.id}
                        className="border-b border-dashed border-line py-8 sm:odd:pr-10 sm:even:border-l sm:even:pl-10"
                    >
                        <Kicker post={post} categories={categories} />
                        <h3 className="mt-2 text-xl leading-snug font-bold tracking-tight">
                            <Link href={postPath(post.slug)} className="hover:text-brand-600">
                                {post.title}
                            </Link>
                        </h3>
                        <p className="mt-2 line-clamp-2 leading-relaxed text-ink-muted">
                            {post.description}
                        </p>
                    </article>
                ))}
            </section>

            <div className="pt-10 pb-16">
                <Link href="/blog" className="text-sm font-semibold text-brand-600 hover:underline">
                    전체 글 {posts.length}편 보기 →
                </Link>
            </div>
        </Container>
    );
}

function Kicker({post, categories}: {post: PostSummary; categories: Category[]}) {
    const category = categories.find((c) => c.keyword === post.categories[0]);
    const publishedAt = post.published_at ?? post.create_time;

    return (
        <p className="text-sm text-ink-muted">
            {category && (
                <>
                    <Link
                        href={categoryPath(category.keyword)}
                        className="font-semibold text-brand-600 hover:underline"
                    >
                        {category.title}
                    </Link>
                    {' · '}
                </>
            )}
            <time dateTime={publishedAt} className="tabular-nums">
                {formatPostDate(publishedAt)}
            </time>
            {post.series && (
                <>
                    {' · '}
                    {post.series.title}
                    {post.series.order != null && ` ${post.series.order}편`}
                </>
            )}
        </p>
    );
}
