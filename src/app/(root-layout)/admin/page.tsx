import Link from 'next/link';
import {getSession} from '@/lib/auth';
import {redirect} from 'next/navigation';

export default async function AdminPage() {
    const session = await getSession();

    if (!session) {
        redirect('/admin/signin');
    }

    return (
        <div className="min-h-screen p-6">
            <header className="flex justify-between items-center py-4">
                <h1 className="text-3xl font-bold">블로그 관리자 대시보드</h1>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* 게시글 관리 */}
                <div className="shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">게시글 관리</h2>
                    <Link
                        href="/admin/board/editor"
                        className="w-full block bg-gray-500 text-white py-2 rounded text-center hover:bg-gray-600"
                        prefetch={true}
                    >
                        새 게시글 작성
                    </Link>
                    <button className="w-full mt-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                        게시글 리스트
                    </button>
                </div>

                {/* 카테고리 관리 */}
                <div className="shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">카테고리 관리</h2>
                    <button className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                        카테고리 추가
                    </button>
                    <button className="w-full mt-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                        카테고리 리스트
                    </button>
                </div>

                {/* 댓글 관리 */}
                <div className="shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">댓글 관리</h2>
                    <button className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                        댓글 검토
                    </button>
                </div>

                {/* 사용자 관리 */}
                <div className="shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">사용자 관리</h2>
                    <button className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                        사용자 리스트
                    </button>
                </div>

                {/* 블로그 설정 */}
                <div className="shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">블로그 설정</h2>
                    <button className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                        설정 변경
                    </button>
                </div>

                {/* 대시보드 */}
                <div className="shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">대시보드</h2>
                    <p>최근 게시글: 10개</p>
                    <p>방문자 수: 1,234명</p>
                    <p>댓글 수: 56개</p>
                </div>
            </main>
        </div>
    );
}
