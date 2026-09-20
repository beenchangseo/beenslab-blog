import {Heading} from '@/lib/toc';

// 본문이 46rem이라 옆에 목차를 붙일 자리가 좁다. 1280px 이상에서만
// 화면 오른쪽에 고정으로 띄우고, 그보다 좁으면 아예 렌더하지 않는다.
export default function TableOfContents({headings}: {headings: Heading[]}) {
    // 제목이 두세 개뿐이면 목차가 오히려 방해된다.
    if (headings.length < 3) {
        return null;
    }

    return (
        <nav
            aria-label="목차"
            className="fixed top-28 right-[max(1.5rem,calc((100vw-var(--container-page))/2))] hidden w-52 xl:block"
        >
            <p className="mb-3 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                목차
            </p>
            <ul className="flex flex-col gap-2 border-l border-line pl-4 text-sm">
                {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
                        <a
                            href={`#${heading.id}`}
                            className="line-clamp-2 text-ink-muted transition-colors hover:text-brand-600"
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
