'use client';

import { ReactNode } from 'react';

interface MobileNavSection {
    id: string;
    title: string;
    icon: ReactNode;
}

interface MobileNavProps {
    sections: MobileNavSection[];
    activeSection: string;
    onSectionClick: (sectionId: string) => void;
}

export function MobileNav({ sections, activeSection, onSectionClick }: MobileNavProps) {
    return (
        <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {sections.map((section) => (
                <button
                    key={section.id}
                    onClick={() => onSectionClick(section.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeSection === section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    <span className="flex-shrink-0">{section.icon}</span>
                    <span>{section.title}</span>
                </button>
            ))}
        </nav>
    );
}
