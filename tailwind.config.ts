import type {Config} from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                // preflight가 html에 fontFamily.sans를 적용하므로 여기만 바꾸면
                // 사이트 전체 기본 폰트가 된다. Pretendard는 라틴 글리프도 포함한다.
                sans: [
                    'Pretendard Variable',
                    'Pretendard',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'system-ui',
                    'Roboto',
                    'Helvetica Neue',
                    'Segoe UI',
                    'Apple SD Gothic Neo',
                    'Noto Sans KR',
                    'Malgun Gothic',
                    'sans-serif',
                ],
                // 등폭 폰트에는 한글 글리프가 없다. 폴백은 글자 단위로 동작하므로
                // Pretendard를 뒤에 두면 영문/기호는 등폭, 한글은 Pretendard로 그려진다.
                mono: [
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    'Liberation Mono',
                    'Courier New',
                    'Pretendard Variable',
                    'Pretendard',
                    'monospace',
                ],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [typography],
};
export default config;
