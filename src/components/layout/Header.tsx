'use client';

import {useEffect, useState} from 'react';
import Nav from './Nav';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {logout} from '@/app/actions/auth';
import ThemeToggle from '@/components/theme/ThemeToggle';
import {Category} from '@/types/blog';

export default function Header({categories = []}: {categories?: Category[]}) {
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
                    <ThemeToggle />
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
