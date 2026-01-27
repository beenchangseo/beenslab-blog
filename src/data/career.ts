export type Mode = 'resume' | 'portfolio';

type Summary = {
    name: string;
    title: string;
    blurb: string;
    highlights: string[];
    contact: {
        email: string;
        phone: string;
        github: string;
        blog: string;
        location: string;
    };
};

type Experience = {
    company: string;
    role: string;
    period: string;
    summary: string;
    achievements: string[];
    keyMetrics?: string[];
};

type Project = {
    title: string;
    period: string;
    description: string;
    stack: string[];
    links: {label: string; href: string}[];
    highlights?: string[];
};

type Post = {
    title: string;
    href: string;
    note: string;
};

type Skills = {
    cat: string;
    items: string[];
};

type Cert = {
    name: string;
    org: string;
    issued: string;
    expires?: string;
    credId?: string;
    credUrl?: string;
};

type Education = {
    school: string;
    degree: string;
    period: string;
};

type Achievement = {
    metric: string;
    description: string;
    icon: string;
};

export const SUMMARY: Summary = {
    name: '서창빈',
    title: '7년차 백엔드 엔지니어 · SRE',
    blurb: '깊이 있는 최적화와 DevOps 역량을 겸비한 백엔드 엔지니어입니다. Node.js, TypeScript를 주력으로 활용하여 고성능·고가용성 시스템을 구축해 왔으며, 누적 회원수 250만의 글로벌 가상자산 거래소에서 트레이딩 플랫폼 백엔드 개발 및 SRE 업무를 담당하고 있습니다.',
    highlights: [
        '24,000배 쿼리 성능 개선',
        '연간 $82,000 비용 절감',
        '70% 빌드 시간 단축',
        '분당 20,000건 푸시 처리',
    ],
    contact: {
        email: 'beenchangseo@gmail.com',
        phone: '010-4075-1343',
        github: 'https://github.com/beenchangseo',
        blog: 'https://blog.beenslab.com',
        location: '서울 강남구',
    },
};

export const KEY_ACHIEVEMENTS: Achievement[] = [
    {
        metric: '24,000배',
        description: '쿼리 성능 개선 (958ms → 0.04ms)',
        icon: '🚀',
    },
    {
        metric: '$82,000',
        description: '연간 클라우드 비용 절감',
        icon: '💰',
    },
    {
        metric: '70%',
        description: 'CI/CD 빌드 시간 단축',
        icon: '⚡',
    },
    {
        metric: '80억원',
        description: 'ITS 시스템 매출 기여',
        icon: '📈',
    },
];

export const EXPERIENCES: Experience[] = [
    {
        company: '디앤에스에버 (Probit Global)',
        role: 'SRE · 백엔드 엔지니어',
        period: '2023.12 – 현재',
        summary:
            '250만 유저가 사용하는 글로벌 가상자산 거래소 Probit Global의 백엔드 개발 및 SRE 업무',
        achievements: [
            '24,000배 쿼리 성능 개선으로 입금 지연 해소 (958ms → 0.04ms)',
            '연간 $82,000 클라우드 비용 절감 (S3 아카이빙, Graviton 도입 등)',
            'Rate Limiter 개선으로 RTT 속도 10배 향상 (30~40ms → 3~10ms)',
            'CI/CD 파이프라인 고도화로 빌드 시간 70% 단축',
            '900+ 마켓 실시간 가격 알림 서비스 개발 (2vCPU/2GB 환경 최적화)',
            'Distroless 기반 거래엔진 컨테이너화로 보안 강화',
            'Playwright E2E 자동화로 QA 생산성 향상',
            'AWS Rekognition 기반 자체 KYC 시스템 개발',
        ],
        keyMetrics: ['250만 유저', '일 50만건 거래', '$82K 절감', '24,000배 개선'],
    },
    {
        company: '오션스 (Probit Korea)',
        role: '백엔드 엔지니어',
        period: '2022.09 – 2023.11',
        summary: '국내 가상자산 거래소의 원화 입출금 및 코어 백엔드 시스템 담당',
        achievements: [
            'AWS SQS 기반 분당 20,000건 처리 대용량 푸시 서버 구축',
            '토스 펌뱅킹 통신 SDK 자체 개발 (입금 오류 Zero 달성)',
            'WebSocket 기반 MFA 전환으로 HTTP 요청 90% 감소',
            'AML 백오피스 시스템 자체 개발로 외부 솔루션 비용 절감',
            'QR 로그인 + 2차 인증으로 세션 탈취 방어',
        ],
        keyMetrics: ['분당 20K 푸시', '90% 요청 감소', '입금 오류 Zero'],
    },
    {
        company: '동부아이씨티',
        role: '백엔드 엔지니어',
        period: '2019.03 – 2022.06',
        summary: '지능형 교통 관제시스템(ITS) 개발 및 10개 도시 약 300개소 시스템 구축',
        achievements: [
            'Kafka 기반 대규모 교차로 신호 데이터 분산 처리 아키텍처 설계',
            'YOLO 모델 기반 열화상 카메라 좌회전 감응 시스템 개발',
            '교통 신호 제어기 TCP Socket 통신 모듈 개발',
            'IoT 와치독 시스템으로 선제적 장애 대응 체계 구축',
            '3년간 80억원 매출 발생에 핵심 기여',
        ],
        keyMetrics: ['10개 도시', '300개소', '80억원 매출'],
    },
];

export const PROJECTS: Project[] = [
    {
        title: '공감일기 앱',
        period: '진행 중',
        description:
            '감정을 공유하고 비슷한 마음을 가진 사람들과 연결되는 플랫폼. 프로젝트 리드 및 백엔드/인프라 전체 담당',
        stack: ['NestJS', 'PostgreSQL', 'Redis', 'Oracle Cloud', 'Jenkins', 'Docker', 'Portainer'],
        links: [],
        highlights: [
            'Jenkins + GitHub Webhook 자동 배포',
            'Docker Registry 자체 구축',
            'Nginx + Certbot SSL 자동화',
            'AI 감정 분석 시스템',
        ],
    },
    {
        title: '개인 기술 블로그',
        period: '2024 – 현재',
        description: 'Next.js 기반 기술 블로그. SSR/ISR로 SEO 최적화 및 성능 극대화',
        stack: ['Next.js', 'NestJS', 'Vercel', 'OAuth'],
        links: [{label: 'blog.beenslab.com', href: 'https://blog.beenslab.com'}],
    },
    {
        title: 'Hitmark',
        period: '2025',
        description:
            '서버리스 기반 블로그 조회수 카운터. Lambda + API Gateway + Firebase로 SVG 배지 제공',
        stack: ['TypeScript', 'AWS Lambda', 'API Gateway', 'Firebase'],
        links: [
            {
                label: '블로그 포스트',
                href: '/blog/post/blog-visitor-counter-build',
            },
        ],
    },
    {
        title: 'Android to iPhone Media Migrator',
        period: '2025',
        description: '안드로이드→아이폰 사진/동영상 메타데이터 자동 보정 도구',
        stack: ['Node.js', 'ADB'],
        links: [
            {
                label: '블로그 포스트',
                href: '/blog/post/android-to-iphone-photo-metadata-fix',
            },
        ],
    },
    {
        title: 'Hangle to Romanized',
        period: '2023',
        description:
            '한글 표준 발음법과 로마자 표기법을 준수한 오픈소스 라이브러리. 외부 의존성 Zero',
        stack: ['TypeScript', 'Jest', 'NPM'],
        links: [],
        highlights: ['비음화/유음화/구개음화 등 음운 변화 구현', 'NPM 배포'],
    },
    {
        title: '마이마켓플레이스',
        period: '2019',
        description: '우리동네 쿠폰적립/맛집 추천 앱. 웹 크롤링 및 GIS 위치 기반 최적화',
        stack: ['Python', 'GIS', 'Crawling'],
        links: [],
        highlights: ['120만건 데이터 수집', 'GIS 쿼리 속도 개선'],
    },
];

export const POSTS: Post[] = [
    {
        title: 'Node.js 이벤트 리스너 안의 비동기 함수, 어디까지 안전할까?',
        href: '/blog/post/node-event-emitter-async',
        note: '실운영 "빈 객체 전송" 이슈 해결 사례',
    },
    {
        title: '비동기 처리는 언제 해야 할까? - Transactional Outbox 패턴',
        href: '/blog/post/transactional-outbox-async-pattern',
        note: 'Outbox 패턴으로 메시지 유실 방지',
    },
    {
        title: 'PostgreSQL Read-Only 레플리카에서 데이터가 바로 안 보이는 이유',
        href: '/blog/post/postgresql-read-replica',
        note: 'Streaming Replication 지연 실험 및 운영 가이드',
    },
    {
        title: '블로그 방문자 수, 직접 카운팅 시스템 구축기',
        href: '/blog/post/blog-visitor-counter-build',
        note: 'AWS Lambda + Firebase + SVG 방문자 카운팅',
    },
];

export const SKILLS: Skills[] = [
    {
        cat: 'Backend',
        items: ['Node.js', 'TypeScript', 'NestJS', 'Express', 'Java', 'Spring Boot', 'Python'],
    },
    {
        cat: 'Database',
        items: ['PostgreSQL', 'MySQL', 'ClickHouse', 'Redis'],
    },
    {
        cat: 'Cloud & Infra',
        items: [
            'AWS (EC2, EKS, Lambda, S3, SQS, Aurora, Rekognition)',
            'Docker',
            'Kubernetes',
            'Nginx',
        ],
    },
    {
        cat: 'DevOps',
        items: ['GitLab CI/CD', 'Jenkins', 'ArgoCD', 'Grafana', 'Datadog', 'Prometheus'],
    },
    {
        cat: 'Protocol & Communication',
        items: ['gRPC', 'WebSocket', 'TCP Socket', 'Kafka', 'OAuth2'],
    },
];

export const CERTS: Cert[] = [
    {
        name: 'AWS Solutions Architect – Associate',
        org: 'Amazon Web Services',
        issued: '2024-07',
        expires: 'No Expiration',
    },
];

export const EDUCATION: Education[] = [
    {
        school: '용인송담대학교',
        degree: '컴퓨터정보과',
        period: '2013.03 – 2019.02',
    },
    {
        school: '국가평생교육진흥원',
        degree: '컴퓨터공학',
        period: '2020.03 – 2020.08',
    },
];
