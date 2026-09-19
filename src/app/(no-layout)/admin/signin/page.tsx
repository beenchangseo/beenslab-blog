'use client';

import {login} from '@/app/actions/auth';
import {useState} from 'react';

export default function SignInPage() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            const result = await login(formData);

            if (result && !result.success) {
                setError(result.error);
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('로그인 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    로그인
                </h1>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            이메일
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    );
}
