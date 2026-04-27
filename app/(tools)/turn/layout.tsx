import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('turn');

export default function TurnLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
