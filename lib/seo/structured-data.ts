import { seoConfig } from '@/config/seo';

export function buildWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seoConfig.site.siteName,
        url: seoConfig.site.siteUrl,
        description: seoConfig.site.description,
    };
}

export function buildWebPageSchema(slug: string) {
    const page = seoConfig.pages[slug];
    if (!page) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        description: page.description,
        url: `${seoConfig.site.siteUrl}${page.path}`,
        isPartOf: {
            '@type': 'WebSite',
            name: seoConfig.site.siteName,
            url: seoConfig.site.siteUrl,
        },
    };
}

export function buildSoftwareAppSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: seoConfig.site.siteName,
        url: seoConfig.site.siteUrl,
        description: seoConfig.site.description,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    };
}
