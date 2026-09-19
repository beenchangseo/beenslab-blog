// /admin/blog는 force-dynamic이라 DB 응답을 기다리는 동안 빈 화면이 보인다.
// 공개 경로에는 loading.tsx를 두지 않는다. Suspense 경계가 생기면 렌더 에러가
// 200 + 빈 본문(soft 404)으로 나가던 과거 문제가 다시 생기기 때문이다.
export default function AdminLoading() {
    return (
        <div className="py-20 flex flex-col gap-4" aria-busy="true" aria-live="polite">
            <span className="sr-only">불러오는 중</span>
            <div className="h-8 w-40 rounded-sm bg-gray-200 dark:bg-gray-800 animate-pulse" />
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2 py-3">
                    <div className="h-3 w-24 rounded-sm bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="h-6 w-3/4 rounded-sm bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="h-4 w-full rounded-sm bg-gray-200 dark:bg-gray-800 animate-pulse" />
                </div>
            ))}
        </div>
    );
}
