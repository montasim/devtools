import type { ReactNode } from 'react';

export function PageLayout({ children }: { children: ReactNode }) {
    return <div className="min-h-screen">{children}</div>;
}
