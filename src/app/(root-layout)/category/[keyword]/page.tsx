import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getAllPosts, getCategories} from '@/lib/posts';
import Container from '@/components/layout/Container';
import PostGrid from '@/components/blog/PostGrid';

export const revalidate = 3600;

export async function generateStaticParams() {
    const categories = await getCategories();
    return categories.map((category) => ({keyword: category.keyword}));
}

async function findCategory(keyword: string) {
    const categories = await getCategories();
    return categories.find((category) => category.keyword === keyword);
}

export async function generateMetadata(props: {
    params: Promise<{keyword: string}>;
}): Promise<Metadata> {
    const {keyword} = await props.params;
    const category = await findCategory(keyword);
    if (!category) {
        notFound();
    }

    const url = `https://blog.beenslab.com/category/${keyword}`;
    const title = `${category.title} - ChangBeen Seo`;
    const description = `${category.title} 주제로 쓴 글 모음입니다.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: 'Beenchangseo Blog',
            locale: 'ko_KR',
            type: 'website',
            images: [{url: '/opengraph-image', width: 1200, height: 630, alt: category.title}],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            creator: '@beenchangseo',
            images: ['/twitter-image'],
        },
        alternates: {canonical: url},
    };
}

export default async function CategoryPage(props: {params: Promise<{keyword: string}>}) {
    const {keyword} = await props.params;
    const [category, posts, categories] = await Promise.all([
        findCategory(keyword),
        getAllPosts(),
        getCategories(),
    ]);

    if (!category) {
        notFound();
    }

    const filtered = posts.filter((post) => post.categories.includes(keyword));

    return (
        <Container className="py-12 sm:py-16">
            <header className="mb-10">
                <h1 className="text-3xl font-bold sm:text-4xl">{category.title}</h1>
                <p className="mt-2 text-ink-muted">{filtered.length}개의 글</p>
            </header>
            <PostGrid posts={filtered} categories={categories} />
        </Container>
    );
}
