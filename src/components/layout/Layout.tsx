import {ReactNode} from 'react';
import Footer from './Footer';
import Header from './Header';
import {Category} from '@/types/blog';

interface LayoutProps {
    children: ReactNode;
    categories?: Category[];
}

export default function Layout({children, categories}: LayoutProps) {
    return (
        <>
            <Header categories={categories} />
            <main className="min-h-[60vh] bg-surface text-ink">{children}</main>
            <Footer />
        </>
    );
}
