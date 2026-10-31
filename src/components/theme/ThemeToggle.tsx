'use client';

import {useSyncExternalStore} from 'react';
import {useTheme} from 'next-themes';
import {FaMoon, FaSun} from 'react-icons/fa';

const subscribe = () => () => {};

export default function ThemeToggle() {
    const {resolvedTheme, setTheme} = useTheme();

    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111111]"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={
                mounted ? (isDark ? '라이트 모드로 전환' : '다크 모드로 전환') : '테마 전환'
            }
        >
            {mounted ? isDark ? <FaSun /> : <FaMoon /> : null}
        </button>
    );
}
