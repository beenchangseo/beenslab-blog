export type Mode = 'resume' | 'portfolio';

type Summary = {
    name: string;
    title: string;
    blurb: string;
    highlights: string[];
    contact: {
        email: string;
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
};

export const SUMMARY: Summary = {
    name: '서창빈',
    title: '8년차 백엔드 엔지니어 · 백엔드 PL',
    blurb: '2019년 교통 신호 제어기와 TCP로 통신하는 서버를 만들며 시작했다. 가상자산 거래소에서는 입금 지연, 처리율 제한, 클라우드 비용 같은 운영 문제를 풀었다. 지금은 하이브랩에서 AI B2B SaaS인 AVIKO의 백엔드 PL을 맡고 있다. 과금과 인증을 처음부터 설계했고, 팀의 코드 규약을 정했고, AI로 개발하는 파이프라인의 원형을 만들어 팀에 공유했다.',
    highlights: [
        '입금 쿼리 958ms → 0.042ms',
        '연간 클라우드 비용 $80,000 이상 절감',
        'QA 티켓 380건 분석·배분',
        '빌드 시간 70% 단축',
    ],
    contact: {
        email: 'beenchangseo@gmail.com',
        github: 'https://github.com/beenchangseo',
        blog: 'https://blog.beenslab.com',
        location: '서울 강남구',
    },
};

export const KEY_ACHIEVEMENTS: Achievement[] = [
    {
        metric: '23,000배',
        description: '입금 지연을 만든 지갑 조회 쿼리 958ms → 0.042ms (Probit)',
    },
    {
        metric: '$80,000+',
        description:
            '연간 클라우드 비용 절감 (Aurora I/O-Optimized 전환과 콜드 데이터 아카이빙, 캔들 시스템 재구성)',
    },
    {
        metric: '380건',
        description: 'QA 티켓을 직접 분석해 BE·FE·AI로 배분 (AVIKO, 2026.08 – 10)',
    },
    {
        metric: '80억 원',
        description: 'ITS 3년 매출 기여 (10개 도시 약 300개소)',
    },
];

export const EXPERIENCES: Experience[] = [
    {
        company: '하이브랩 (AVIKO)',
        role: '백엔드 PL',
        period: '2026.02 – 현재',
        summary:
            'AI 에이전트, 문서 캔버스, 회의록, 워크플로를 제공하는 B2B AI 업무 플랫폼 AVIKO의 아키텍처 대부분을 검토하고 결정. 책임급으로 입사해 백엔드 PL을 맡았고, FE·AI의 아키텍처와 주요 기술 결정도 검토. 인프라는 FE PL과 함께 담당',
        achievements: [
            '과금·잔고 시스템을 처음부터 설계. 모든 기능은 사용 이벤트만 남기고 공통 엔진이 차감하는 단일 경로, 복식부기 원장, 3중 멱등으로 재처리 때 이중 청구가 나지 않도록 설계',
            '잔고를 나중에 별도 서비스로 떼어 낼 수 있도록 Facade 하나로만 접근하게 설계',
            'OAuth 2.0(Authorization Code + PKCE) 인가 서버 구축. refresh 토큰 재사용 감지와 전체 로그아웃 뒤 접근 토큰 즉시 회수 설계',
            '개인 워크스페이스 중심 모델을 조직 소유 B2B 멀티테넌시로 단계 전환 (권한 모델, 워크스페이스 스코핑, 결제 계정)',
            '직접 만든 문서 블록 부분 편집 프로토콜을, 문서 저장을 파일로 바꾸면서 걷어내고 전체 교체로 통일',
            'QA 티켓 380건을 직접 분석해 BE·FE·AI로 배분. 재현 전에는 원인을 판정하지 않는 원칙으로 버그가 아닌 티켓을 걸러냄',
            '이 과정을 LLM 에이전트 QA 파이프라인으로 자동화 (Python 약 9,700줄, 테스트 221개). 병렬 실행이 로컬 자원과 토큰을 과하게 쓰자 2주 만에 걷어내고 단건 검증 중심으로 다시 설계',
            'AI 개발 파이프라인(요구사항 인터뷰 → 코드 대조 분석 → 구현 → 커밋 전 검증, 핵심 도메인은 TDD 강제)의 원형을 만들어 팀에 공유. 같은 세션이 자기 코드를 리뷰하지 않도록 격리 리뷰와 교차 모델 리뷰 도입',
            '코드 컨벤션과 API·계층 규약을 정의(2026.03). 팀 규칙이 되어 자동 검사로 강제됨',
        ],
        keyMetrics: ['백엔드 PL', 'QA 티켓 380건', 'B2B SaaS'],
    },
    {
        company: '디앤에스에버 (Probit Global)',
        role: 'SRE · 백엔드 엔지니어',
        period: '2023.12 – 2026.01',
        summary:
            '누적 회원 250만 명의 글로벌 가상자산 거래소 Probit Global. 트레이딩·입출금 플랫폼의 백엔드 개발과 SRE, Git 저장소 메인테이너',
        achievements: [
            'ALGO 극소량 입금 공격 때 입금 지연의 원인 쿼리를 958ms → 0.042ms로 개선. 인덱스를 늘리는 대신, 정렬 기준이 없던 LIMIT 1 쿼리에 ORDER BY DESC를 줘서 기존 인덱스를 타게 함',
            'trading DB의 콜드 데이터를 Parquet로 S3에 옮기고 Aurora I/O-Optimized로 전환. 37TB → 13TB, 월 $14,911 → $8,800',
            '캔들 데이터 동기화를 Lambda에서 EKS 컨테이너로 옮기고 로그 레벨·인스턴스·서브넷을 정리해 월 $1,582 → $529. 초당 1,000건이 넘을 때 LIMIT 때문에 빠지던 데이터도 해결',
            'Redis Lua 토큰 버킷으로 Rate Limiter를 다시 써서 30~40ms → 3~10ms, Redis 왕복 최대 8회 → 3회. 기존 인터페이스를 유지한 V2 전략으로 일부 서비스부터 점진 전환',
            '모놀리식 서비스를 11개 폴리레포와 공통 라이브러리로 분리. grpc를 @grpc/grpc-js로 바꿔 네이티브 의존성을 없앤 뒤 Graviton(ARM64)으로 옮겨 인프라 비용 20% 절감. Node.js v14 → v20 전환을 더해 빌드 시간 70% 단축',
            'Slack 명령 한 줄로 도는 Playwright E2E 파이프라인 구축. CI 테스트 10분 → 55초',
            'Go 거래엔진을 Distroless 이미지로 배포해, 소스를 열지 않고도 개발자가 로컬에서 거래엔진과 연동 개발',
            '900개 이상 마켓의 가격 알림 서비스 개발. Backpressure와 2차원 Map 조회로 대량 발송 중에도 메모리 2GB 이하 유지',
            'AWS Rekognition으로 KYC를 내재화해 건당 과금하던 외부 솔루션 대비 비용 절감',
        ],
        keyMetrics: ['누적 회원 250만', '일 50만건 거래', '연 $80K+ 절감', '쿼리 23,000배 개선'],
    },
    {
        company: '오션스 (Probit Korea)',
        role: '백엔드 엔지니어',
        period: '2022.09 – 2023.11',
        summary: '국내 가상자산 거래소 Probit의 원화 입출금, 인증, 알림 백엔드',
        achievements: [
            'DB 테이블을 큐로 쓰던 알림에서 푸시를 SQS 기반 서버로 분리. 분당 20,000건 처리, 전송 지연 3~15초 → 2~3초',
            'VAN사 전문 통신용 토스 펌뱅킹 SDK(TCP Socket)를 직접 개발. 외부 라이브러리는 두 개만 쓰고, 하루 한 번 잔고 대사로 거래소와 VAN사 데이터 정합성 검증. 입금·정산 오류 0',
            '2FA(ARS) 인증을 폴링에서 WebSocket으로 바꿔 HTTP 요청 90% 감소',
            'QR 로그인에 앱 2차 인증을 강제해 세션 탈취에 대비',
            '가상자산 거래소에 맞춘 AML 백오피스(Watch List, 의심거래보고, KoFIU 리포팅)를 자체 개발해 외부 솔루션 대체',
        ],
        keyMetrics: ['분당 20K 푸시', '90% 요청 감소', '입금 오류 Zero'],
    },
    {
        company: '동부아이씨티',
        role: '백엔드 엔지니어 (R&D)',
        period: '2019.03 – 2022.06',
        summary:
            '지능형 교통 관제 시스템(ITS)을 설계부터 운영까지 맡아 10개 도시 약 300개소에 구축',
        achievements: [
            '교차로 신호 데이터 수집을 Kafka로 옮겨, 관제센터와 보행 신호 수신기, 좌회전 검지기처럼 늘어나는 수신처가 같은 데이터를 따로 받게 함',
            '열화상 카메라와 YOLO로 차량을 감지해 좌회전 신호를 주는 감응 시스템 개발',
            '교통 신호 제어기와 IoT 장비의 TCP Socket 통신 모듈 직접 구현',
            '교차로 IoT 장비 상태를 실시간으로 보는 와치독을 만들어, 민원이 들어오기 전에 장애 대응',
            '3년간 약 80억 원 매출에 핵심 기여',
        ],
        keyMetrics: ['10개 도시', '300개소', '80억원 매출'],
    },
];

export const PROJECTS: Project[] = [
    {
        title: '플리픽',
        period: '2026.03 – 현재',
        description:
            '직장인 밴드의 공연 곡 투표 앱. 카톡 투표로는 곡을 들으며 고르기 번거로워 투표와 음원 듣기를 한 화면에 붙임. 밴드 팀원들의 의견을 받아 회사와 병행하며 혼자 개발·운영',
        stack: ['Next.js', 'Supabase', 'PostgreSQL', 'Vercel', 'Playwright', 'TLA+'],
        links: [{label: 'plypick.kr', href: 'https://plypick.kr'}],
        highlights: [
            '우리 밴드 외 3~4개 팀이 써 봄',
            '익명 투표를 화면이 아니라 DB 권한으로 보장',
            'DB를 싱가포르에서 서울로 옮겨 쓰기 정지 약 6분, TTFB 중앙값 0.65초 → 0.35초',
            'TLA+ 모델 검사로 투표 동시성 결함 2건 발견',
        ],
    },
    {
        title: '공감일기',
        period: '2025.11 – 진행 중',
        description:
            '일기로 감정을 나누고 비슷한 마음의 사람과 연결되는 앱. 기획, 디자인, 인프라, 백엔드를 맡아 프로젝트 리드',
        stack: ['NestJS', 'PostgreSQL', 'Redis', 'Oracle Cloud', 'Jenkins', 'Docker', 'Portainer'],
        links: [],
        highlights: [
            'OAuth 2.0 인증 서버 직접 개발 (재사용 가능한 템플릿으로 설계)',
            'Jenkins + GitHub Webhook 자동 배포, Docker Registry 자체 구축',
            'Nginx + Certbot SSL 자동화',
            'LLM 감정 분석을 큐로 분리',
        ],
    },
    {
        title: '개인 기술 블로그',
        period: '2024 – 현재',
        description:
            '이 블로그와 이력서. Next.js App Router로 직접 만들고, 글은 PostgreSQL에 두고 ISR로 내보냄. 조회수는 Redis',
        stack: ['Next.js', 'PostgreSQL', 'Prisma', 'Redis', 'Vercel'],
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
];

export const POSTS: Post[] = [
    {
        title: '예상과 달랐던 PostgreSQL 인덱스 사용 — 왜 인덱스를 타지 않았을까?',
        href: '/blog/post/postgresql-index-not-used',
        note: '입금 지연 때 잡은 지갑 조회 쿼리 958ms → 0.042ms',
    },
    {
        title: 'redis와 lua스크립트를 이용한 처리율 제한 장치 만들기',
        href: '/blog/post/redis-lua-rate-limiter',
        note: '토큰 버킷 Lua 스크립트로 다시 쓴 Rate Limiter',
    },
    {
        title: '데이터베이스와의 전쟁: 암호화폐 거래소 성능 개선기 2편',
        href: '/blog/post/data-clean-project-2',
        note: 'trading DB 37TB → 13TB, Aurora I/O-Optimized 전환',
    },
    {
        title: 'AWS 비용 최적화 (feat 거래소 캔들 데이터)',
        href: '/blog/post/aws-cost-optimization-candle',
        note: '캔들 시스템 월 $1,582 → $529',
    },
    {
        title: 'Node.js 이벤트 리스너 안의 비동기 함수, 어디까지 안전할까? (EventEmitter with async)',
        href: '/blog/post/event-emitter-with-async',
        note: '운영에서 만난 "빈 객체 전송" 문제',
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
            'AWS (ECS, EKS, Lambda, S3, SQS, Aurora, Rekognition)',
            'Terraform',
            'Docker',
            'Kubernetes',
            'Nginx',
        ],
    },
    {
        cat: 'DevOps',
        items: [
            'GitLab CI/CD',
            'GitHub Actions',
            'Jenkins',
            'ArgoCD',
            'Grafana',
            'Datadog',
            'Prometheus',
        ],
    },
    {
        cat: 'Protocol & Communication',
        items: ['gRPC', 'WebSocket', 'TCP Socket', 'Kafka', 'OAuth 2.0'],
    },
    {
        cat: 'AI Development',
        items: ['Claude Code (hooks, skills)', 'Codex 교차 리뷰', 'MCP (Serena)'],
    },
    {
        cat: 'Web',
        items: ['Next.js', 'React', 'Supabase', 'Vercel'],
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
