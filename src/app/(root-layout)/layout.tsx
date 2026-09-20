import '../globals.css';
import Layout from '../../components/layout/Layout';
import {getCategories} from '@/lib/posts';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // 헤더 네비가 카테고리를 그대로 쓴다. getCategories는 React.cache라
    // 같은 렌더 안에서 페이지가 또 불러도 쿼리가 늘지 않는다.
    const categories = await getCategories();

    return <Layout categories={categories}>{children}</Layout>;
}
