import {getAllPosts} from '@/lib/posts';
import BlogSearch from '../../../../components/BlogSearch';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
    const posts = await getAllPosts();
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">블로그 관리</h1>
                <Link
                    href="/admin/board/editor"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    새 글 작성
                </Link>
            </div>
            <BlogSearch posts={posts} showAdminButtons={true} />
        </div>
    );
}
