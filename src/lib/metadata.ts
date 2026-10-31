import type {Metadata} from 'next';
import {SITE_NAME, TWITTER_HANDLE, absoluteUrl} from '@/lib/site';

type PageMetadataInput = {
    title: string;
    description: string;
    path: string;
    keywords?: string[];
    shareTitle?: string;
    shareDescription?: string;
    imageAlt?: string;
    type?: 'website' | 'profile';
};

// Next merges metadata shallowly: once a page defines openGraph, the root
// opengraph-image file convention no longer applies to it. Every page therefore
// points at the image routes directly, and this is the one place that does it.
export function pageMetadata({
    title,
    description,
    path,
    keywords,
    shareTitle = title,
    shareDescription = description,
    imageAlt = SITE_NAME,
    type = 'website',
}: PageMetadataInput): Metadata {
    const url = absoluteUrl(path);

    return {
        title,
        description,
        keywords,
        openGraph: {
            title: shareTitle,
            description: shareDescription,
            url,
            siteName: SITE_NAME,
            locale: 'ko_KR',
            type,
            images: [{url: '/opengraph-image', width: 1200, height: 630, alt: imageAlt}],
        },
        twitter: {
            card: 'summary_large_image',
            title: shareTitle,
            description: shareDescription,
            creator: TWITTER_HANDLE,
            images: ['/twitter-image'],
        },
        alternates: {canonical: url},
    };
}
