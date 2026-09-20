'use client';

import {useEffect, useState} from 'react';
import Nav from './Nav';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {logout} from '@/app/actions/auth';
import DarkModeButton from '../mode/DarkMode';
import {GetCategoryResponseDto} from '@/types/blog';

export default function Header({categories = []}: {categories?: GetCategoryResponseDto[]}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const router = useRouter();

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
            className={`sticky top-0 left-0 z-20 w-full bg-surface transition-shadow ${
                isScrolled ? 'shadow-sm shadow-black/5 dark:shadow-black/40' : ''
            }`}
        >
            <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-6 px-5 sm:px-8">
                <Link href="/" className="shrink-0 font-bold tracking-tight">
                    Beenslab
                </Link>

                <nav className="hidden flex-1 items-center gap-6 sm:flex" aria-label="주요 메뉴">
                    <Nav type="normal" categories={categories} />
                </nav>

                <div className="flex shrink-0 items-center gap-4">
                    <DarkModeButton />
                    {/* 로그인 버튼은 방문자에게 보일 이유가 없다. /admin으로 가면
                        proxy가 로그인 화면으로 보낸다. 로그아웃만 노출한다. */}
                    {isLoggedIn && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-xs text-ink-muted hover:text-brand-600"
                        >
                            Logout
                        </button>
                    )}
                    <button
                        type="button"
                        className="sm:hidden"
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
                            className="h-6 w-6"
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
                </div>
            </div>

            <nav
                id="mobile-nav"
                aria-label="모바일 메뉴"
                className={`absolute top-16 left-0 h-screen w-full flex-col bg-surface px-5 pt-4 sm:hidden ${
                    isMenuOpen ? 'flex' : 'hidden'
                }`}
            >
                <Nav type="toggle" categories={categories} onClick={() => setIsMenuOpen(false)} />
            </nav>
        </header>
    );
}
