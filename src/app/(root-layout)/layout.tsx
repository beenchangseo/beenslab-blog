import '@/app/globals.css';
import Layout from '@/components/layout/Layout';
import {getCategories} from '@/lib/posts';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const categories = await getCategories();

    return <Layout categories={categories}>{children}</Layout>;
}
