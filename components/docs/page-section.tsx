'use client';

import { ReactNode } from 'react';

interface PageSectionProps {
    id: string;
    title: string;
    description?: string;
    children: ReactNode;
}

export function PageSection({ id, title, description, children }: PageSectionProps) {
    return (
        <section id={id} className="scroll-mt-32">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {title}
                </h2>
                {description && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}
