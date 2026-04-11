'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
    PageLayout,
    PageHeader,
    SidebarNav,
    PageSection,
    PageContent,
    MobileNav,
} from '@/components/docs';

interface DocSection {
    id: string;
    title: string;
    icon: React.ReactNode;
}

const disclaimerSections: DocSection[] = [
    {
        id: 'general',
        title: 'General Disclaimer',
        icon: <AlertCircle className="w-5 h-5" />,
    },
    {
        id: 'no-professional-advice',
        title: 'Not Professional Advice',
        icon: <AlertCircle className="w-5 h-5" />,
    },
    {
        id: 'tool-disclaimers',
        title: 'Tool-Specific',
        icon: <AlertCircle className="w-5 h-5" />,
    },
    {
        id: 'data-security',
        title: 'Data Security',
        icon: <AlertCircle className="w-5 h-5" />,
    },
    {
        id: 'liability',
        title: 'Liability',
        icon: <AlertCircle className="w-5 h-5" />,
    },
    {
        id: 'contact',
        title: 'Contact',
        icon: <AlertCircle className="w-5 h-5" />,
    },
];

export default function DisclaimerPage() {
    const [activeSection, setActiveSection] = useState('general');

    useEffect(() => {
        const handleScroll = () => {
            const sections = disclaimerSections.map((section) =>
                document.getElementById(section.id),
            );
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(disclaimerSections[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };

    return (
        <PageLayout>
            <PageHeader
                icon={<AlertCircle className="w-6 h-6 text-white" />}
                title="Disclaimer"
                description="Important disclaimers and limitations regarding our services"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={disclaimerSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
                mobileNav={
                    <MobileNav
                        sections={disclaimerSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
            >
                <PageSection
                    id="general"
                    title="General Disclaimer"
                    description="Services provided for informational purposes only."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            The information, tools, and services provided by DevTools are for
                            general informational and educational purposes only. We make no warranty
                            regarding the accuracy or completeness of any information on this site.
                        </p>
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                Always verify results before using them in production environments.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="no-professional-advice"
                    title="Not Professional Advice"
                    description="DevTools does not provide professional services."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            DevTools is a collection of developer utilities and does not constitute
                            professional advice of any kind.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Any reliance you place on information from DevTools is strictly at your
                            own risk. We recommend verifying all output and consulting appropriate
                            professionals for critical needs.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="tool-disclaimers"
                    title="Tool-Specific Disclaimers"
                    description="Each tool has specific limitations."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                JSON & Text Tools
                            </h3>
                            <p className="text-sm">
                                Always validate output before using in applications. Large files may
                                not process correctly. Edge cases may not be handled perfectly.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Branch Name Generator
                            </h3>
                            <p className="text-sm">
                                Generated names follow common conventions but may not match all team
                                standards. Always verify branch names meet your project&apos;s
                                requirements.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="data-security"
                    title="Data Privacy and Security"
                    description="All processing happens locally in your browser."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            While we process all data locally in your browser, please note that your
                            device may cache data temporarily and browser history may record pages
                            visited.
                        </p>
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
                            <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                Warning: Do not use our tools to process sensitive information such
                                as passwords, API keys, or personal data.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="liability"
                    title="Limitation of Liability"
                    description="Our liability is limited by law."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            In no event shall DevTools be liable for any indirect, incidental,
                            special, consequential, or punitive damages.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Since our services are free, our liability is limited to the maximum
                            extent permitted by applicable law.
                        </p>
                    </div>
                </PageSection>

                <PageSection id="contact" title="Contact Us" description="Questions? Get in touch.">
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>If you have questions about this Disclaimer, please contact us:</p>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                Email: legal@devtools.com
                            </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: January 1, 2025
                        </p>
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
