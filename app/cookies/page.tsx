'use client';

import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
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

const cookieSections: DocSection[] = [
    {
        id: 'what-are-cookies',
        title: 'What Are Cookies',
        icon: <Cookie className="w-5 h-5" />,
    },
    {
        id: 'types',
        title: 'Types We Use',
        icon: <Cookie className="w-5 h-5" />,
    },
    {
        id: 'third-party',
        title: 'Third-Party Cookies',
        icon: <Cookie className="w-5 h-5" />,
    },
    {
        id: 'managing',
        title: 'Managing Cookies',
        icon: <Cookie className="w-5 h-5" />,
    },
    {
        id: 'updates',
        title: 'Updates',
        icon: <Cookie className="w-5 h-5" />,
    },
    {
        id: 'contact',
        title: 'Contact',
        icon: <Cookie className="w-5 h-5" />,
    },
];

export default function CookiePolicyPage() {
    const [activeSection, setActiveSection] = useState('what-are-cookies');

    useEffect(() => {
        const handleScroll = () => {
            const sections = cookieSections.map((section) => document.getElementById(section.id));
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(cookieSections[i].id);
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
                icon={<Cookie className="w-6 h-6 text-white" />}
                title="Cookie Policy"
                description="Learn how we use cookies to enhance your experience"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={cookieSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
                mobileNav={
                    <MobileNav
                        sections={cookieSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
            >
                <PageSection
                    id="what-are-cookies"
                    title="What Are Cookies"
                    description="Cookies are small text files stored on your device."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            Cookies are small text files that are stored on your device when you
                            visit a website. They help provide you with a better experience by
                            remembering your preferences and understanding how you use our services.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="types"
                    title="Types of Cookies We Use"
                    description="We use essential, preference, and analytics cookies."
                >
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Essential Cookies
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Required for the site to function properly, including maintaining
                                session state and enabling security features. These cannot be
                                disabled.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Preference Cookies
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Remember your choices and settings like theme preference (light/dark
                                mode) and tool options.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Analytics Cookies
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Help us understand how visitors use our website to improve
                                performance and identify popular features.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="third-party"
                    title="Third-Party Services"
                    description="We use trusted third-party services."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>We may use Google Analytics to understand usage patterns.</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            You can opt-out of Google Analytics by installing the{' '}
                            <a
                                href="https://tools.google.com/dlpage/gaoptout"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Google Analytics Opt-out Browser Add-on
                            </a>
                            .
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="managing"
                    title="Managing Cookies"
                    description="You can control cookies through your browser settings."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>You can control cookies through your browser settings:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                            <li>
                                <strong>Chrome:</strong> Settings → Privacy and security → Cookies
                            </li>
                            <li>
                                <strong>Firefox:</strong> Options → Privacy & Security → Cookies
                            </li>
                            <li>
                                <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                            </li>
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Disabling cookies may affect some functionality of our website.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="updates"
                    title="Updates to This Policy"
                    description="We may update this policy from time to time."
                >
                    <p className="text-gray-700 dark:text-gray-300">
                        We may update this Cookie Policy to reflect changes in our practices. We
                        will notify users of material changes by posting the updated policy on this
                        page.
                    </p>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Questions about cookies? Contact us."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>If you have questions about our use of cookies, please contact us:</p>
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
