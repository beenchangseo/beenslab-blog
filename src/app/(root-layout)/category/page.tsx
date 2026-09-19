import {Metadata} from 'next';
import {Suspense} from 'react';
import {getAllPosts, getCategories} from '@/lib/posts';
import CategoryFilter, {
    CategoryFilterFromSearchParams,
} from '../../../components/category/CategoryFilter';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: '카테고리 - ChangBeen Seo',
    description:
        'JavaScript, AWS, PostgreSQL, Redis, Git 등 다양한 기술 주제별로 분류된 블로그 포스트를 탐색하세요.',
    keywords: [
        'JavaScript',
        'TypeScript',
        'AWS',
        'PostgreSQL',
        'Redis',
        'Kubernetes',
        'Docker',
        'DevOps',
        'Infra',
        '기술 블로그 카테고리',
    ],
    openGraph: {
        title: '카테고리 - ChangBeen Seo',
        description: '다양한 기술 주제별로 분류된 블로그 포스트',
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
        description: '다양한 기술 주제별로 분류된 블로그 포스트',
        creator: '@beenchangseo',
        images: ['/twitter-image'],
    },
    alternates: {
        canonical: 'https://blog.beenslab.com/category',
    },
};

export default async function Category() {
    const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);

    // useSearchParams bails out of static rendering up to this boundary, so the fallback
    // (unfiltered list) is what ends up in the prerendered HTML.
    return (
        <Suspense fallback={<CategoryFilter posts={posts} categories={categories} />}>
            <CategoryFilterFromSearchParams posts={posts} categories={categories} />
        </Suspense>
    );
}
