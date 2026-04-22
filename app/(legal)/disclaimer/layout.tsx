import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('disclaimer');

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
