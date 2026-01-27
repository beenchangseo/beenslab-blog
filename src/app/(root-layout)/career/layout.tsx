import {Metadata} from 'next';

export const metadata: Metadata = {
    title: '이력서 - 서창빈',
    description:
        'Node.js 백엔드 엔지니어 서창빈의 이력서와 포트폴리오. 암호화폐 거래소 백엔드 개발, SRE, AWS 최적화 경험.',
    keywords: [
        '서창빈',
        'beenchangseo',
        '백엔드 엔지니어',
        'Node.js 개발자',
        'SRE',
        'AWS',
        '이력서',
        '포트폴리오',
    ],
    openGraph: {
        title: '이력서 - 서창빈 (Node.js 백엔드 엔지니어)',
        description:
            '암호화폐 거래소 백엔드 개발 및 SRE. 24,000배 쿼리 성능 개선, 연간 $82,000 비용 절감 경험.',
        url: 'https://blog.beenslab.com/career',
        siteName: 'Beenchangseo Blog',
        locale: 'ko_KR',
        type: 'profile',
        images: [
            {
                url: 'https://blog.beenslab.com/images/default-og.png',
                width: 1200,
                height: 630,
                alt: '서창빈 이력서',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '이력서 - 서창빈 (Node.js 백엔드 엔지니어)',
        description:
            '암호화폐 거래소 백엔드 개발 및 SRE. 24,000배 쿼리 성능 개선, 연간 $82,000 비용 절감 경험.',
        images: ['https://blog.beenslab.com/images/default-og.png'],
        creator: '@beenchangseo',
    },
    alternates: {
        canonical: 'https://blog.beenslab.com/career',
    },
};

export default function CareerLayout({children}: {children: React.ReactNode}) {
    return children;
}
