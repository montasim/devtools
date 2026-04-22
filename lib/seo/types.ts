export interface PageSEO {
    title: string;
    description: string;
    keywords: string[];
    path: string;
    priority?: number;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    ogImage?: string;
}

export interface SiteDefaults {
    siteName: string;
    siteUrl: string;
    titleDefault: string;
    description: string;
    locale: string;
    twitterHandle: string;
    ogImage: string;
    keywords: string[];
}

export interface SEOConfig {
    site: SiteDefaults;
    pages: Record<string, PageSEO>;
    disallowedPaths: string[];
}
