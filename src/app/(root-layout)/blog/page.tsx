import {Metadata} from 'next';
import {getAllPosts} from '@/lib/posts';
import BlogSearch from '../../../components/BlogSearch';

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
    const posts = await getAllPosts();
    return <BlogSearch posts={posts} />;
}
