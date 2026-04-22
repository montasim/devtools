import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('cookies');

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
