import type { Metadata } from 'next';
import { seoConfig } from '@/config/seo';

function buildOpenGraph(title: string, description: string, path: string) {
    return {
        title,
        description,
        url: `${seoConfig.site.siteUrl}${path}`,
        siteName: seoConfig.site.siteName,
        locale: seoConfig.site.locale,
        type: 'website' as const,
        images: [
            {
                url: seoConfig.site.ogImage,
                width: 1200,
                height: 630,
                alt: title,
            },
        ],
    };
}

function buildTwitter(title: string, description: string) {
    return {
        card: 'summary_large_image' as const,
        title,
        description,
        images: [seoConfig.site.ogImage],
        creator: seoConfig.site.twitterHandle,
    };
}

export function generateRootMetadata(): Metadata {
    return {
        title: {
            template: `%s | ${seoConfig.site.siteName}`,
            default: seoConfig.site.titleDefault,
        },
        description: seoConfig.site.description,
        metadataBase: new URL(seoConfig.site.siteUrl),
        keywords: seoConfig.site.keywords,
        openGraph: buildOpenGraph(seoConfig.site.titleDefault, seoConfig.site.description, '/'),
        twitter: buildTwitter(seoConfig.site.titleDefault, seoConfig.site.description),
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export function generatePageMetadata(slug: string): Metadata {
    const page = seoConfig.pages[slug];

    if (!page) {
        return {};
    }

    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        alternates: {
            canonical: `${seoConfig.site.siteUrl}${page.path}`,
        },
        openGraph: buildOpenGraph(page.title, page.description, page.path),
        twitter: buildTwitter(page.title, page.description),
    };
}
