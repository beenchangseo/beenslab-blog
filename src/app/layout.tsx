import type {Metadata} from 'next';
import ThemeProvider from '@/components/theme/ThemeProvider';
import {SITE_URL} from '@/lib/site';

const PRETENDARD_CSS =
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'Beenchangseo Blog',
    description: 'Beenchangseo Blog',
    openGraph: {
        title: 'Beenchangseo Blog',
        description: 'Beenchangseo Blog',
        url: new URL(SITE_URL),
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
                {/* Not metadata.alternates.types: Next merges metadata shallowly, so any page
                    that sets alternates.canonical would drop it. */}
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
