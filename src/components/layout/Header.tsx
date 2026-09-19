'use client';

import {useEffect, useState} from 'react';
import Nav from './Nav';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {logout} from '@/app/actions/auth';
import DarkModeButton from '../mode/DarkMode';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const router = useRouter();

    const handleLogin = () => {
        router.push('/admin/signin');
    };

    const handleLogout = async () => {
        setIsLoggedIn(false);
        await logout();
        router.push('/');
        router.refresh();
    };

    useEffect(() => {
        const checkAuth = async () => {
            const response = await fetch('/api/auth/session');
            setIsLoggedIn(response.ok);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        // 같은 값으로 set하면 React가 리렌더를 건너뛰므로 스크롤마다 렌더되지 않는다.
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        handleScroll();
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMenuOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);

        // 메뉴가 화면을 덮는 동안 뒤 배경이 스크롤되지 않게 막는다.
        const {overflow} = document.body.style;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = overflow;
        };
    }, [isMenuOpen]);

    return (
        <header
            className={`sticky top-0 left-0 w-full z-10 h-20 font-mono transition duration-500 bg-white dark:bg-[#111111] ${
                // 다크 모드에서 밝은 회색 그림자가 떠 보이던 하드코딩 값을 대체한다.
                isScrolled ? 'shadow-md shadow-gray-200 dark:shadow-black/40' : ''
            }`}
        >
            <div className="max-w-(--breakpoint-md) h-20 flex flex-nowrap items-center justify-between m-auto px-8">
                <Link href="/">
                    <span className="font-bold stroke-black dark:stroke-white">Beenslab Blog</span>
                </Link>

                <div className="flex flex-nowrap gap-8 items-center">
                    <DarkModeButton />
                    <button
                        type="button"
                        className="m-0 p-0 sm:hidden"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-nav"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-7 h-7 transition duration-500 stroke-black dark:stroke-white"
                            aria-hidden="true"
                        >
                            {isMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            )}
                        </svg>
                    </button>
                    <div className="flex-nowrap items-center justify-center gap-5 text-center hidden sm:flex">
                        <Nav type="normal" />
                        <button
                            className="ml-10 text-xs"
                            onClick={isLoggedIn ? handleLogout : handleLogin}
                        >
                            {isLoggedIn ? 'Logout' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
            <div
                id="mobile-nav"
                className={`w-full h-screen absolute top-20 left-0 bg-white dark:bg-[#111111] flex-col flex-nowrap p-5 sm:hidden ${
                    isMenuOpen ? 'flex' : 'hidden'
                }`}
            >
                <Nav type="toggle" onClick={() => setIsMenuOpen(false)} />
            </div>
        </header>
    );
}
