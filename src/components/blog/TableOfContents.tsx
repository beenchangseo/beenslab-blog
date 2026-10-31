import {Heading} from '@/lib/toc';

export default function TableOfContents({headings}: {headings: Heading[]}) {
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
