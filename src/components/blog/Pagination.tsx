import Link from 'next/link';

type Props = {
    current: number;
    totalPages: number;
    // 1페이지와 그 이후의 주소 모양이 달라서 함수로 받는다.
    hrefFor: (page: number) => string;
};

const linkClass =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line px-3 text-sm transition-colors hover:border-brand-500 hover:text-brand-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500';

export default function Pagination({current, totalPages, hrefFor}: Props) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = Array.from({length: totalPages}, (_, i) => i + 1);

    return (
        <nav aria-label="페이지 목록" className="mt-14 flex flex-wrap justify-center gap-2">
            {current > 1 && (
                <Link href={hrefFor(current - 1)} className={linkClass} rel="prev">
                    이전
                </Link>
            )}
            {pages.map((page) =>
                page === current ? (
                    <span
                        key={page}
                        aria-current="page"
                        className={`${linkClass} border-brand-500 font-semibold text-brand-600`}
                    >
                        {page}
                    </span>
                ) : (
                    <Link key={page} href={hrefFor(page)} className={linkClass}>
                        {page}
                    </Link>
                ),
            )}
            {current < totalPages && (
                <Link href={hrefFor(current + 1)} className={linkClass} rel="next">
                    다음
                </Link>
            )}
        </nav>
    );
}
