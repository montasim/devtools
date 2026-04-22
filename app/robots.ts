import type { MetadataRoute } from 'next';
import { seoConfig } from '@/config/seo';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: seoConfig.disallowedPaths,
            },
        ],
        sitemap: `${seoConfig.site.siteUrl}/sitemap.xml`,
    };
}
