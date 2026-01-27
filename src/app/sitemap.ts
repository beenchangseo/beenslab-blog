import type {MetadataRoute} from 'next';
import {fetchAllPosts, fetchCategories} from './lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = 'https://blog.beenslab.com';
    const posts = (await fetchAllPosts()).data;
    const categories = (await fetchCategories()).data;

    // Get the most recent post update time for blog list page
    const mostRecentPostUpdate =
        posts.length > 0
            ? new Date(Math.max(...posts.map((p) => new Date(p.update_time).getTime())))
            : new Date();

    const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
        url: `${base}/blog/post/${p.slug}`,
        lastModified: new Date(p.update_time),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${base}/category?filter=${cat.keyword}`,
        lastModified: mostRecentPostUpdate,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [
        {
            url: `${base}/`,
            lastModified: mostRecentPostUpdate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${base}/blog`,
            lastModified: mostRecentPostUpdate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${base}/category`,
            lastModified: mostRecentPostUpdate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${base}/career`,
            lastModified: new Date('2024-01-01'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        ...postUrls,
        ...categoryUrls,
    ];
}
