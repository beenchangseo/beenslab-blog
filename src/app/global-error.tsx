'use client';

// 루트 layout 자체가 실패했을 때의 마지막 방어선이라 html/body를 직접 렌더한다.
// 이 시점에는 스타일시트도 못 불러왔을 수 있어 인라인 스타일만 쓴다.
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & {digest?: string};
    reset: () => void;
}) {
    return (
        <html lang="ko">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    padding: 24,
                    textAlign: 'center',
                    fontFamily:
                        "Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
                    color: '#111111',
                    background: '#ffffff',
                }}
            >
                <h1 style={{fontSize: 24, fontWeight: 700, margin: 0}}>문제가 발생했습니다</h1>
                <p style={{margin: 0, color: '#555555'}}>
                    페이지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
                </p>
                {error.digest && (
                    <p style={{margin: 0, fontSize: 12, color: '#999999'}}>
                        digest: {error.digest}
                    </p>
                )}
                <button
                    type="button"
                    onClick={reset}
                    style={{
                        marginTop: 8,
                        padding: '12px 20px',
                        borderRadius: 8,
                        border: 'none',
                        fontWeight: 600,
                        color: '#ffffff',
                        background: '#4f46e5',
                        cursor: 'pointer',
                    }}
                >
                    다시 시도
                </button>
            </body>
        </html>
    );
}
