/** @type {import('next').NextConfig} */

const nextConfig = {
    // output: 'export', // github page에서 vercel로 이전하면서 주석 처리함
    reactStrictMode: false,
    images: {
        // AVIF를 먼저 시도하고, 지원하지 않는 브라우저는 WebP로 떨어진다.
        formats: ['image/avif', 'image/webp'],
        // 게시글 이미지는 한 번 올리면 바뀌지 않으므로 변환 결과를 길게 캐시한다.
        minimumCacheTTL: 2678400, // 31일
    },
    compiler: {
        styledComponents: true, // styled-components 사용 시 컴파일러에 추가
    },
};

module.exports = nextConfig;
