'use client';

import {useEffect, useRef, useState} from 'react';
import Nav from './Nav';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import dynamic from 'next/dynamic';
import {logout} from '@/app/actions/auth';

const DarkModeButton = dynamic(() => import('../mode/DarkMode'), {ssr: false});

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const headerRef = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLDivElement>(null);
    const [onToggle, setOnToggle] = useState<boolean>(false);

    const router = useRouter();

    const handleScroll = () => {
        if (window.scrollY > 0) {
            headerRef.current?.classList.add('shadow-[0_5px_7px_0px_#ececec]');
            return;
        }
        headerRef.current?.classList.remove('shadow-[0_5px_7px_0px_#ececec]');
    };

    const handleToggle = () => {
        if (onToggle) {
            toggleRef.current?.classList.add('hidden');
        } else {
            toggleRef.current?.classList.remove('hidden');
        }
        setOnToggle((prev) => !prev);
    };

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
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <header
                ref={headerRef}
                className="sticky top-0 left-0 w-full z-10 h-20 font-mono transition duration-500 bg-white dark:bg-[#111111]"
            >
                <div className="max-w-screen-md h-20 flex flex-nowrap items-center justify-between m-auto px-8">
                    <Link href="/">
                        <h1 className="font-bold stroke-black dark:stroke-white">Beenslab Blog</h1>
                    </Link>

                    <div className="flex flex-nowrap gap-8 items-center">
                        <DarkModeButton />
                        <button type="button" className="m-0 p-0 sm:hidden" onClick={handleToggle}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-7 h-7 transition duration-500 stroke-black dark:stroke-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
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
                    ref={toggleRef}
                    className="w-full h-screen absolute top-20 left-0 bg-white flex-col flex-nowrap p-5 flex hidden dark:bg-[#111111]"
                >
                    <Nav type="toggle" onClick={handleToggle} />
                </div>
            </header>
        </>
    );
}
