'use client';

import { ReactNode } from 'react';

interface PageContentProps {
    sidebar: ReactNode;
    children: ReactNode;
    mobileNav?: ReactNode;
}

export function PageContent({ sidebar, children, mobileNav }: PageContentProps) {
    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Mobile Navigation */}
            {mobileNav && <div className="md:hidden mb-6">{mobileNav}</div>}

            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="hidden md:block w-64 flex-shrink-0">{sidebar}</div>
                <main className="flex-1 min-w-0 space-y-12 sm:space-y-16 pb-12 sm:pb-16">
                    {children}
                </main>
            </div>
        </div>
    );
}
