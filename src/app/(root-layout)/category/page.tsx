import {Metadata} from 'next';
import {fetchAllPosts, fetchCategories} from '../../lib/api';
import CategoryFilter from '../../../components/category/CategoryFilter';

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
                url: 'https://blog.beenslab.com/images/default-og.png',
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
        images: ['https://blog.beenslab.com/images/default-og.png'],
        creator: '@beenchangseo',
    },
    alternates: {
        canonical: 'https://blog.beenslab.com/category',
    },
};

export default async function Category() {
    const posts = (await fetchAllPosts()).data;
    const categories = (await fetchCategories()).data;
    return <CategoryFilter posts={posts} categories={categories} />;
}
