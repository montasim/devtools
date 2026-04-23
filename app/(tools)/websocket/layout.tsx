import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata = generatePageMetadata('websocket');

export default function WebSocketLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
