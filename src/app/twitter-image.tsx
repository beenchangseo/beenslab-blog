import {ImageResponse} from 'next/og';

export const alt = 'ChangBeen Seo - 백엔드 개발자';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function TwitterImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 60,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    padding: '80px',
                    textAlign: 'center',
                }}
            >
                <div style={{display: 'flex', fontSize: 80, fontWeight: 'bold', marginBottom: 20}}>
                    ChangBeen Seo
                </div>
                <div style={{display: 'flex', fontSize: 40, opacity: 0.9}}>
                    백엔드 개발자 · AWS · DevOps
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 30,
                        opacity: 0.8,
                        marginTop: 40,
                        maxWidth: 900,
                    }}
                >
                    더 나은 아키텍처와 효율적인 솔루션으로 세상을 편리하게 만듭니다
                </div>
            </div>
        ),
        {
            ...size,
        },
    );
}
