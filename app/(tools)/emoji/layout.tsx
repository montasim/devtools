import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('emoji');

export default function EmojiLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
