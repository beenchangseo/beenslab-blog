import {pageMetadata} from '@/lib/metadata';

export const metadata = pageMetadata({
    title: '이력서 - 서창빈',
    description:
        'Node.js 백엔드 엔지니어 서창빈의 이력서와 포트폴리오. 암호화폐 거래소 백엔드 개발, SRE, AWS 최적화 경험.',
    shareTitle: '이력서 - 서창빈 (Node.js 백엔드 엔지니어)',
    shareDescription:
        '암호화폐 거래소 백엔드 개발 및 SRE. 24,000배 쿼리 성능 개선, 연간 $82,000 비용 절감 경험.',
    path: '/career',
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
    imageAlt: '서창빈 이력서',
    type: 'profile',
});

export default function CareerLayout({children}: {children: React.ReactNode}) {
    return children;
}
