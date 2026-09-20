'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {GetCategoryResponseDto} from '@/types/blog';

interface NavProps {
    type: 'toggle' | 'normal';
    categories: GetCategoryResponseDto[];
    onClick?: () => void;
}

// 카테고리가 4개로 줄어서 상단 네비에 그대로 올릴 수 있게 됐다.
// 카테고리는 쿼리(?filter=)가 아니라 실제 경로다. useSearchParams를 쓰면
// 헤더가 들어간 모든 페이지가 정적 렌더링에서 빠진다.
export default function Nav({type, categories, onClick}: NavProps) {
    const pathname = usePathname();

    const items = [
        {label: '전체', href: '/blog', active: pathname === '/blog'},
        ...categories.map((category) => ({
            label: category.title,
            href: `/category/${category.keyword}`,
            active: pathname === `/category/${category.keyword}`,
        })),
        {label: 'Career', href: '/career', active: pathname === '/career'},
    ];

    const base =
        type === 'normal'
            ? 'text-sm transition-colors hover:text-brand-600'
            : 'py-3 text-lg transition-colors hover:text-brand-600';

    return (
        <>
            {items.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClick}
                    aria-current={item.active ? 'page' : undefined}
                    className={`${base} ${item.active ? 'font-semibold text-brand-600' : 'text-ink-muted'}`}
                >
                    {item.label}
                </Link>
            ))}
        </>
    );
}
