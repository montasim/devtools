import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('cron');

export default function CronLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
