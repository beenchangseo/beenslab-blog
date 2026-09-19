'use client';

// 렌더 에러 경계. DB 장애처럼 서버 렌더가 실패했을 때 여기로 떨어진다.
// 루트 layout.tsx가 CSS를 import하지 않으므로 여기서 직접 가져온다.
import './globals.css';
import {useEffect} from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';

export default function Error({
    error,
    reset,
}: {
    error: Error & {digest?: string};
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Render error:', error);
    }, [error]);

    return (
        <Layout>
            <section className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 py-20">
                <p className="font-mono text-6xl sm:text-8xl font-bold text-gray-300 dark:text-gray-700">
                    500
                </p>
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">문제가 발생했습니다</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        잠시 후 다시 시도해 주세요. 계속되면 메일로 알려주시면 감사하겠습니다.
                    </p>
                    {error.digest && (
                        <p className="mt-2 font-mono text-xs text-gray-400 dark:text-gray-600">
                            digest: {error.digest}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        type="button"
                        onClick={reset}
                        className="px-5 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                    >
                        다시 시도
                    </button>
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
