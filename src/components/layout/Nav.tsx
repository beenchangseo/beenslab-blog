'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Category} from '@/types/blog';
import {categoryPath} from '@/lib/paths';

interface NavProps {
    type: 'toggle' | 'normal';
    categories: Category[];
    onClick?: () => void;
}

export default function Nav({type, categories, onClick}: NavProps) {
    const pathname = usePathname();

    const items = [
        {label: '전체', href: '/blog', active: pathname === '/blog'},
        ...categories.map((category) => ({
            label: category.title,
            href: categoryPath(category.keyword),
            active: pathname === categoryPath(category.keyword),
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
