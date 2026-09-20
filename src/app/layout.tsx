import type {Metadata} from 'next';
import ThemeProvider from '../components/mode/ThemeProvider';
import {BASE_URL} from '../types/constants';

// Pretendard 동적 서브셋: unicode-range로 92개 청크가 쪼개져 있어
// 브라우저가 실제로 쓰인 글자 범위만 내려받는다. 라틴 글리프도 포함하므로
// 별도의 영문 폰트는 쓰지 않는다. 폰트 스택은 tailwind.config.ts에 있다.
const PRETENDARD_CSS =
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: 'Beenchangseo Blog',
    description: 'Beenchangseo Blog',
    openGraph: {
        title: 'Beenchangseo Blog',
        description: 'Beenchangseo Blog',
        url: new URL(BASE_URL),
        locale: 'ko_KR',
        siteName: 'Beenchangseo Blog',
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" suppressHydrationWarning={true}>
            <head>
                {/* metadata.alternates.types에 넣으면 각 페이지가 alternates.canonical을
                    정의하는 순간 통째로 덮인다(Next의 얕은 병합). 여기서 직접 넣는다. */}
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title="Beenslab Blog"
                    href="/rss.xml"
                />
                <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
                <link rel="stylesheet" href={PRETENDARD_CSS} crossOrigin="anonymous" />
            </head>
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
