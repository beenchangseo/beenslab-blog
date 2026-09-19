// 루트 layout.tsx는 CSS를 import하지 않으므로(route group 레이아웃이 각자 한다)
// 이 파일이 직접 globals.css와 Header/Footer를 가져온다.
import './globals.css';
import Link from 'next/link';
import Layout from '../components/layout/Layout';

export default function NotFound() {
    return (
        <Layout>
            <section className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 py-20">
                <p className="font-mono text-6xl sm:text-8xl font-bold text-gray-300 dark:text-gray-700">
                    404
                </p>
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        주소가 바뀌었거나 삭제된 글일 수 있습니다.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                    <Link
                        href="/blog"
                        className="px-5 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                    >
                        블로그 목록으로
                    </Link>
                    <Link
                        href="/"
                        className="px-5 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        홈으로
                    </Link>
                </div>
            </section>
        </Layout>
    );
}
