import {pageMetadata} from '@/lib/metadata';

export const metadata = pageMetadata({
    title: '이력서 - 서창빈',
    description:
        '백엔드 엔지니어 서창빈의 이력서와 포트폴리오. AI B2B SaaS 백엔드 PL, 가상자산 거래소 백엔드와 SRE, 교통 관제 시스템.',
    shareTitle: '이력서 - 서창빈 (백엔드 엔지니어)',
    shareDescription:
        'AI B2B SaaS 백엔드 PL. 가상자산 거래소에서 쿼리 958ms → 0.042ms, 연간 $80,000 이상 비용 절감.',
    path: '/career',
    keywords: [
        '서창빈',
        'beenchangseo',
        '백엔드 엔지니어',
        '백엔드 PL',
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
