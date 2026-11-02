import type {ReactNode} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import {pageMetadata} from '@/lib/metadata';

export const metadata = pageMetadata({
    title: '소개 - 서창빈',
    description: '데이터를 안전하고 정확하게 전달하는 백엔드 개발자, 서창빈입니다.',
    path: '/about',
    keywords: ['서창빈', 'beenchangseo', '백엔드 엔지니어', '소개'],
    imageAlt: '서창빈 소개',
    type: 'profile',
});

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

            <p className="mt-14 text-2xl leading-snug font-bold sm:text-3xl">
                데이터를 안전하고 정확하게 전달하는 백엔드 개발자가 되자!
            </p>

            <section className="space-y-4 leading-relaxed">
                <Heading>하는 일</Heading>
                <p>
                    2019년 교통 관제 시스템 백엔드 개발을 시작으로 가상자산 거래소를 거쳐, 지금은
                    하이브랩에서 AI B2B SaaS AVIKO의 백엔드 PL을 맡고 있습니다.
                </p>
                <p>
                    자세한 경력은{' '}
                    <Link href="/career" className={link}>
                        이력서
                    </Link>
                    에 정리해 두었습니다.
                </p>
            </section>

            <section className="space-y-4 leading-relaxed">
                <Heading>일 밖에서</Heading>
                <p>현재 직장인 밴드 일코해제에서 키보드로 활동하고 있습니다.</p>
                <p>
                    밴드 활동을 하면서 필요하다고 생각했던 곡 투표 앱 플리픽을 만들어서 사용
                    중입니다.{' '}
                    <a href="https://plypick.kr" className={link}>
                        plypick.kr
                    </a>
                </p>
            </section>

            <section className="space-y-4 leading-relaxed">
                <Heading>이 블로그</Heading>
                <p>
                    인상 깊었던 것들을 기록합니다.{' '}
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
