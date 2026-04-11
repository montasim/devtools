'use client';

import { ReactNode } from 'react';

interface NavSection {
    id: string;
    title: string;
    icon: ReactNode;
    count?: number;
}

interface SidebarNavProps {
    sections: NavSection[];
    activeSection: string;
    onSectionClick: (sectionId: string) => void;
}

export function SidebarNav({ sections, activeSection, onSectionClick }: SidebarNavProps) {
    return (
        <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => onSectionClick(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                            activeSection === section.id
                                ? 'bg-primary/10 text-primary shadow-lg'
                                : 'hover:bg-primary/20 hover:text-primary'
                        }`}
                    >
                        <span className="flex-shrink-0">{section.icon}</span>
                        <span className="font-medium">{section.title}</span>
                        {section.count !== undefined && (
                            <span className="ml-auto text-sm opacity-70">{section.count}</span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
