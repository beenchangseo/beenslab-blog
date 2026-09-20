'use client';

import {useEffect, useRef} from 'react';
import {useTheme} from 'next-themes';

// giscus(= GitHub Discussions)를 붙인다. 네 값이 모두 채워져야 켜지고,
// 하나라도 비면 아무것도 그리지 않는다. 값은 giscus.app에서 받는다.
//
//   NEXT_PUBLIC_GISCUS_REPO=beenchangseo/beenslab-blog
//   NEXT_PUBLIC_GISCUS_REPO_ID=...
//   NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
//   NEXT_PUBLIC_GISCUS_CATEGORY_ID=...
//
// NEXT_PUBLIC_* 는 빌드 때 코드에 박히므로, Vercel에 넣은 뒤 다시 배포해야
// 반영된다.
const REPO = process.env.NEXT_PUBLIC_GISCUS_REPO;
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const CATEGORY = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

export default function Comments() {
    const containerRef = useRef<HTMLDivElement>(null);
    const {resolvedTheme} = useTheme();
    const giscusTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID) return;

        // 이미 붙어 있으면 테마만 바꿔서 다시 그리지 않게 한다.
        const frame = container.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
        if (frame) {
            frame.contentWindow?.postMessage(
                {giscus: {setConfig: {theme: giscusTheme}}},
                'https://giscus.app',
            );
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-repo', REPO);
        script.setAttribute('data-repo-id', REPO_ID);
        script.setAttribute('data-category', CATEGORY);
        script.setAttribute('data-category-id', CATEGORY_ID);
        // 글 주소로 토론을 찾는다. slug가 바뀌면 댓글이 끊기는데, 그때는
        // post_slug_history를 보고 GitHub 쪽 토론 제목을 옮겨줘야 한다.
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'top');
        script.setAttribute('data-theme', giscusTheme);
        script.setAttribute('data-lang', 'ko');
        script.setAttribute('data-loading', 'lazy');

        container.appendChild(script);
    }, [giscusTheme]);

    if (!REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID) {
        return null;
    }

    return (
        <section className="mt-16 border-t border-line pt-10">
            <h2 className="mb-8 text-xl font-bold">댓글</h2>
            <div ref={containerRef} />
        </section>
    );
}
