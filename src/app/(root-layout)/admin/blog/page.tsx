import Link from 'next/link';
import {getAllPostsForAdmin} from '@/lib/posts';
import AdminPostList from '@/components/admin/AdminPostList';
import Container from '@/components/layout/Container';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
    const posts = await getAllPostsForAdmin();
    return (
        <Container className="py-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">블로그 관리</h1>
                <Link
                    href="/admin/board/editor"
                    className="bg-green-500 text-white px-4 py-2 rounded-sm hover:bg-green-600"
                >
                    새 글 작성
                </Link>
            </div>
            <AdminPostList posts={posts} />
        </Container>
    );
}
