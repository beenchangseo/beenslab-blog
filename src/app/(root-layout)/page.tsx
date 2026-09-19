import {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'ChangBeen Seo - 백엔드 개발자',
    description:
        '더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다. 기술과 경험을 나누는 개발자 서창빈의 블로그입니다.',
    keywords: ['백엔드 개발자', 'Node.js', 'TypeScript', 'AWS', 'DevOps', '서창빈', 'beenchangseo'],
    openGraph: {
        title: 'ChangBeen Seo - 백엔드 개발자',
        description: '더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다.',
        url: 'https://blog.beenslab.com/',
        siteName: 'Beenchangseo Blog',
        locale: 'ko_KR',
        type: 'website',
        images: [{url: '/opengraph-image', width: 1200, height: 630, alt: 'ChangBeen Seo Blog'}],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ChangBeen Seo - 백엔드 개발자',
        description: '더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다.',
        creator: '@beenchangseo',
        images: ['/twitter-image'],
    },
    alternates: {
        canonical: 'https://blog.beenslab.com/',
    },
};

export default function Home() {
    return (
        <>
            <section className="min-h-[60vh] flex flex-col items-center justify-center my-16">
                <div className="flex flex-col items-center text-center gap-6">
                    <Image
                        src="/images/profile.jpeg"
                        alt="서창빈 프로필 사진"
                        width={180}
                        height={180}
                        // 원본이 정사각형이 아니라서 object-cover가 없으면 눌려 보인다.
                        className="rounded-full shadow-lg object-cover"
                        priority={true}
                        style={{width: 180, height: 180}}
                    />
                    <div>
                        <h1 className="font-bold text-4xl sm:text-6xl font-mono mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                            ChangBeen Seo
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-2xl">
                            더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-3xl mx-auto mb-16 px-4">
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl p-10 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-start gap-4 mb-6">
                        <span className="text-5xl">✍️</span>
                        <div>
                            <h2 className="font-bold text-3xl mb-3 text-gray-900 dark:text-white">
                                개발 여정의 기록
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                이 블로그는 제 아이디어와 여정의 흔적을 기록한 공간입니다.
                            </p>
                            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                기술과 경험, 그리고 삶 속에서 얻은 통찰을 나누며 더 큰 세상을
                                만들어가고자 합니다.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-md"
                        >
                            블로그 보기
                            <span>→</span>
                        </Link>
                        <Link
                            href="/career"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-md"
                        >
                            이력서 보기
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
