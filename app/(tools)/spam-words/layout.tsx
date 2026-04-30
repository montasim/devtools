import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('spam-words');

export default function SpamWordsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
