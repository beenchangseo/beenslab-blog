'use client';

import {useSyncExternalStore} from 'react';
import {useTheme} from 'next-themes';
import {FaMoon, FaSun} from 'react-icons/fa';

const subscribe = () => () => {};

export default function DarkModeButton() {
    // enableSystem을 쓰면 theme이 'system'일 수 있어 실제 적용값인 resolvedTheme을 본다.
    const {resolvedTheme, setTheme} = useTheme();

    // 서버에서는 테마를 알 수 없다. 마운트 전까지 아이콘을 비워 두되 버튼 크기는
    // 유지해서, 아이콘이 뒤늦게 나타나며 헤더가 밀리는 것을 막는다.
    // effect 안에서 setState를 부르면 렌더가 연쇄되므로 하이드레이션 여부는
    // useSyncExternalStore로 읽는다(서버 스냅샷 false, 클라이언트 true).
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
            {/* 현재 상태가 아니라 누르면 바뀔 모드를 보여준다. */}
            {mounted ? isDark ? <FaSun /> : <FaMoon /> : null}
        </button>
    );
}
