import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('user-agent');

export default function UserAgentLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
