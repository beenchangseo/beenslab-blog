import {Metadata} from 'next';
import {getAllPosts, getCategories} from '@/lib/posts';
import PostSearch from '@/components/blog/PostSearch';
import Container from '@/components/layout/Container';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: '블로그 - ChangBeen Seo',
    description:
        '백엔드 개발, AWS, DevOps, 데이터베이스 최적화 등 실전 경험과 기술 인사이트를 공유합니다.',
    keywords: [
        'Node.js',
        'TypeScript',
        'AWS',
        'PostgreSQL',
        'Redis',
        'Kubernetes',
        '백엔드 개발',
        'DevOps',
        'SRE',
    ],
    openGraph: {
        title: '블로그 - ChangBeen Seo',
        description: '백엔드 개발, AWS, DevOps, 데이터베이스 최적화 등 실전 경험과 기술 인사이트',
        url: 'https://blog.beenslab.com/blog',
        siteName: 'Beenchangseo Blog',
        locale: 'ko_KR',
        type: 'website',
        images: [{url: '/opengraph-image', width: 1200, height: 630, alt: 'Beenchangseo Blog'}],
    },
    twitter: {
        card: 'summary_large_image',
        title: '블로그 - ChangBeen Seo',
        description: '백엔드 개발, AWS, DevOps, 데이터베이스 최적화 등 실전 경험과 기술 인사이트',
        creator: '@beenchangseo',
        images: ['/twitter-image'],
    },
    alternates: {
        canonical: 'https://blog.beenslab.com/blog',
    },
};

export default async function Blog() {
    const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);

    return (
        <Container className="py-12 sm:py-16">
            <header className="mb-10">
                <h1 className="text-3xl font-bold sm:text-4xl">글</h1>
                <p className="mt-2 text-ink-muted">
                    백엔드, 데이터베이스, 인프라에서 겪은 것들을 기록합니다.
                </p>
            </header>
            <PostSearch posts={posts} categories={categories} />
        </Container>
    );
}
