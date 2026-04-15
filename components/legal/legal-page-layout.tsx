'use client';

import { useState, useEffect } from 'react';
import { ReactNode } from 'react';
import { ArrowUp } from 'lucide-react';
import Link from "next/link";

export interface LegalPageLayoutProps {
    title: string;
    description: string;
    icon: ReactNode;
    lastUpdated: string;
    children: ReactNode;
    sections?: string[];
}

export function LegalPageLayout({
    title,
    description,
    icon,
    lastUpdated,
    children,
    sections = [],
}: LegalPageLayoutProps) {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);

            // Update active section in TOC
            const sectionElements = sections.map((id) =>
                document.getElementById(id?.toLowerCase().replace(/\s+/g, '-')),
            );
            const scrollPosition = window.scrollY + 150;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const element = sectionElements[i];
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i] || '');
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId.toLowerCase().replace(/\s+/g, '-'));
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Compact Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
                                {title}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                Last updated: {lastUpdated}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="lg:flex lg:gap-8">
                    {/* Table of Contents - Sidebar */}
                    {sections.length > 0 && (
                        <aside className="mb-6 lg:mb-0 lg:w-56 lg:shrink-0">
                            <div className="sticky top-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100">
                                    On this page
                                </h2>
                                <nav>
                                    <ul className="space-y-1.5">
                                        {sections.map((section, index) => (
                                            <li key={index}>
                                                <button
                                                    onClick={() => scrollToSection(section)}
                                                    className={`text-xs transition-colors hover:text-primary ${
                                                        activeSection === section
                                                            ? 'font-medium text-primary'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {section}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <article className="prose prose-gray dark:prose-invert max-w-none">
                            {children}
                        </article>
                    </main>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-8">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                            Questions about these documents?{' '}
                            <Link
                                href="mailto:legal@devtools.com"
                                className="text-primary hover:underline"
                            >
                                Contact us
                            </Link>
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="/privacy"
                                className="text-gray-600 hover:text-primary dark:text-gray-400"
                            >
                                Privacy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-gray-600 hover:text-primary dark:text-gray-400"
                            >
                                Terms
                            </Link>
                            <Link
                                href="/cookies"
                                className="text-gray-600 hover:text-primary dark:text-gray-400"
                            >
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg transition-all hover:bg-primary/90"
                    aria-label="Back to top"
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
