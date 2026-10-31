/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 31,
    },
    async redirects() {
        return [
            // The admin home is the post list. A page-level redirect() would answer 200,
            // because admin/loading.tsx wraps admin pages in a Suspense boundary.
            {source: '/admin', destination: '/admin/blog', permanent: false},
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
