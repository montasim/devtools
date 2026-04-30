import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('free-email');

export default function FreeEmailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
