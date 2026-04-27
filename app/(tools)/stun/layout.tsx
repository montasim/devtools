import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('stun');

export default function StunLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
