import {defineConfig} from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// Next 16에서 `next lint`가 사라져 ESLint CLI를 직접 쓴다(`npm run lint` = `eslint .`).
// ESLint 10은 flat config만 지원하므로 .eslintrc.json은 제거했다.
export default defineConfig([
    {
        ignores: ['.next/**', 'test-results/**', 'next-env.d.ts', '.gstack/**'],
    },
    {
        extends: [...nextCoreWebVitals, ...nextTypescript],
    },
]);
