import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('timezones');

export default function TimezonesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
