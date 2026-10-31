/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    images: {
        // AVIF를 먼저 시도하고, 지원하지 않는 브라우저는 WebP로 떨어진다.
        formats: ['image/avif', 'image/webp'],
        // 게시글 이미지는 한 번 올리면 바뀌지 않으므로 변환 결과를 길게 캐시한다.
        minimumCacheTTL: 2678400, // 31일
    },
    async redirects() {
        return [
            // Old category links used /category?filter=<keyword>. Handling this here
            // instead of reading searchParams keeps /category a static page.
            {
                source: '/category',
                has: [{type: 'query', key: 'filter', value: '(?<keyword>.+)'}],
                destination: '/category/:keyword',
                permanent: false,
            },
        ];
    },
};

module.exports = nextConfig;
