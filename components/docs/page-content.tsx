'use client';

import { ReactNode } from 'react';

interface PageContentProps {
    sidebar: ReactNode;
    children: ReactNode;
}

export function PageContent({ sidebar, children }: PageContentProps) {
    return (
        <div className="mx-auto py-8">
            <div className="flex gap-8">
                {sidebar}
                <main className="flex-1 min-w-0 space-y-16 pb-16">{children}</main>
            </div>
        </div>
    );
}
