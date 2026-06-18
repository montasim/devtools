import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('webhook');

export default function WebhookLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
