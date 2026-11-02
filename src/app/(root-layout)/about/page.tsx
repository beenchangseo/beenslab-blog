import type {ReactNode} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import {pageMetadata} from '@/lib/metadata';

export const metadata = pageMetadata({
    title: '소개 - 서창빈',
    description:
        '백엔드 엔지니어 서창빈. 데이터를 잘, 안전하게 전달하는 개발자가 되자는 생각으로 일한다.',
    path: '/about',
    keywords: ['서창빈', 'beenchangseo', '백엔드 엔지니어', '소개'],
    imageAlt: '서창빈 소개',
    type: 'profile',
});

const PRINCIPLES = [
    '재현하기 전에는 원인을 판정하지 않는다. QA 티켓 중에는 버그가 아닌 것도 많았다.',
    '코드를 쓴 세션이 그 코드를 리뷰하게 두지 않는다. 날카로운 리뷰에는 맥락을 공유하지 않는 리뷰어가 필요하다.',
    '운영 배포는 AI에게 맡기지 않는다. 느리지만, 무엇을 배포해야 하고 무엇을 배포했는지 내가 안다.',
    '잔고처럼 중요한 시스템은 직접 만든다. 요구사항은 계속 바뀌고, 남의 시스템으로는 따라가기 어렵다.',
    '핵심 기능 하나부터 만든다. 처음엔 이것저것 무겁게 만들었다가 본질이 더 중요하다는 걸 알았다.',
];

const link = 'text-brand-600 underline-offset-4 hover:underline';

function Heading({children}: {children: ReactNode}) {
    return <h2 className="mt-14 mb-4 text-xl font-bold">{children}</h2>;
}

export default function AboutPage() {
    return (
        <Container width="reading" className="break-keep py-14 sm:py-20">
            <header className="flex items-center gap-5">
                <Image
                    src="/images/profile.jpeg"
                    alt="서창빈 프로필 사진"
                    width={80}
                    height={80}
                    priority
                    className="size-20 shrink-0 rounded-full object-cover"
                />
                <div>
                    <h1 className="text-3xl font-bold">서창빈</h1>
                    <p className="mt-1 text-ink-muted">백엔드 엔지니어</p>
                </div>
            </header>

            <div className="mt-12 space-y-4 text-lg leading-relaxed">
                <p>백엔드 개발자가 하는 일은 결국 데이터를 전달하는 일이라고 생각한다.</p>
                <p>
                    브라우저에서 생긴 사용자의 행동을 API로 받아 DB에 넣는다. 사용자가 요청하면 DB의
                    데이터를 다시 브라우저로 보낸다. 서로 다른 시스템끼리 주고받는 내부 통신도
                    데이터를 전달하는 일이다.
                </p>
                <p>그래서 목표는 하나다. 데이터를 아주 잘, 안전하게 전달하는 개발자가 되자.</p>
            </div>

            <section className="space-y-4 leading-relaxed">
                <Heading>하는 일</Heading>
                <p>
                    2019년 교통 관제 시스템으로 시작했다. 교차로 신호 제어기와 TCP로 통신하는 서버를
                    만들었고, 10개 도시 약 300개소의 신호 데이터를 Kafka로 받아 여러 수신처에 나눠
                    보냈다.
                </p>
                <p>
                    2022년부터는 가상자산 거래소에서 일했다. 원화 입출금 펌뱅킹과 푸시 서버를
                    만들었고, 입금 지연, 처리율 제한, 클라우드 비용 같은 운영 문제를 맡았다.
                </p>
                <p>
                    2026년 2월부터 하이브랩에서 AI B2B SaaS인 AVIKO의 백엔드 PL을 맡고 있다. 과금과
                    잔고, 인증을 처음부터 설계했다.
                </p>
                <p>
                    자세한 경력은{' '}
                    <Link href="/career" className={link}>
                        이력서
                    </Link>
                    에 있다.
                </p>
            </section>

            <section className="leading-relaxed">
                <Heading>일하는 방식</Heading>
                <ol className="list-decimal space-y-3 pl-5">
                    {PRINCIPLES.map((principle) => (
                        <li key={principle}>{principle}</li>
                    ))}
                </ol>
            </section>

            <section className="space-y-4 leading-relaxed">
                <Heading>일 밖에서</Heading>
                <p>직장인 밴드에서 키보드를 친다.</p>
                <p>
                    공연 곡은 투표로 정한다. 카톡 투표는 곡을 듣고 고르기가 번거롭고, 유튜브 뮤직
                    플레이리스트는 구독자가 아니면 막힌다. 그래서 투표와 음원 듣기를 한 화면에 붙인{' '}
                    <a href="https://plypick.kr" className={link}>
                        플리픽
                    </a>
                    을 만들었다.
                </p>
            </section>

            <section className="space-y-4 leading-relaxed">
                <Heading>이 블로그</Heading>
                <p>
                    인상 깊었던 것들을 기록한다.{' '}
                    <Link href="/blog" className={link}>
                        글 목록
                    </Link>
                </p>
            </section>

            <section className="space-y-4 leading-relaxed">
                <Heading>연락</Heading>
                <p>
                    <a href="mailto:beenchangseo@gmail.com" className={link}>
                        beenchangseo@gmail.com
                    </a>
                    {' · '}
                    <a
                        href="https://github.com/beenchangseo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={link}
                    >
                        github.com/beenchangseo
                    </a>
                </p>
            </section>
        </Container>
    );
}
