import type { MetadataRoute } from 'next';
import { seoConfig } from '@/config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
    return Object.values(seoConfig.pages).map((page) => ({
        url: `${seoConfig.site.siteUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency ?? 'monthly',
        priority: page.priority ?? 0.5,
    }));
}
