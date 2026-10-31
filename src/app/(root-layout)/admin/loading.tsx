// Keep loading.tsx off public routes. A Suspense fallback commits the response to 200
// before the page runs, so notFound() and render errors can no longer set 404 or 500.
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
