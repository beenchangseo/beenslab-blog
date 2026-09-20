import {ReactNode} from 'react';
import Footer from './Footer';
import Header from './Header';
import {GetCategoryResponseDto} from '@/types/blog';

interface LayoutProps {
    children: ReactNode;
    // error.tsx / not-found.tsx는 클라이언트 경계라 DB를 읽을 수 없다.
    // 그쪽에서는 넘기지 않고, 헤더가 카테고리 없이 렌더된다.
    categories?: GetCategoryResponseDto[];
}

export default function Layout({children, categories}: LayoutProps) {
    return (
        <>
            <Header categories={categories} />
            {/* 폭은 각 페이지가 Container로 정한다. 여기서 묶어두면 카드
                그리드를 넓게 쓸 수 없고, career 페이지의 max-w-5xl도 무시된다. */}
            <main className="min-h-[60vh] bg-surface text-ink">{children}</main>
            <Footer />
        </>
    );
}
