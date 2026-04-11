'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
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

const privacySections: DocSection[] = [
    {
        id: 'introduction',
        title: 'Introduction',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        id: 'information-we-collect',
        title: 'Information We Collect',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        id: 'how-we-use-information',
        title: 'How We Use Information',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        id: 'data-processing',
        title: 'Data Processing',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        id: 'third-party-services',
        title: 'Third-Party Services',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        id: 'data-security',
        title: 'Data Security',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        id: 'your-rights',
        title: 'Your Rights',
        icon: <Shield className="w-5 h-5" />,
    },
    {
        id: 'contact',
        title: 'Contact Us',
        icon: <Shield className="w-5 h-5" />,
    },
];

export default function PrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState('introduction');

    useEffect(() => {
        const handleScroll = () => {
            const sections = privacySections.map((section) => document.getElementById(section.id));
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(privacySections[i].id);
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
                icon={<Shield className="w-6 h-6 text-white" />}
                title="Privacy Policy"
                description="Learn how DevTools protects your data with client-side processing"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={privacySections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
                mobileNav={
                    <MobileNav
                        sections={privacySections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
            >
                <PageSection
                    id="introduction"
                    title="Introduction"
                    description="Your privacy is our priority. All processing happens locally in your browser."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            At DevTools, we take your privacy seriously. This Privacy Policy
                            explains how we collect, use, disclose, and safeguard your information
                            when you use our free online developer tools.
                        </p>
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Privacy First: All data processing happens in your browser. Your
                                data never leaves your device.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="information-we-collect"
                    title="Information We Collect"
                    description="We collect minimal information to provide and improve our services."
                >
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Device and Browser Information
                            </h3>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Screen resolution</li>
                                <li>Language and region settings</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Local Storage Data
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                Our tools store data locally in your browser for your convenience:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mt-2">
                                <li>Recent tool usage history</li>
                                <li>Preferences and settings</li>
                                <li>Input data for quick access</li>
                            </ul>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                <strong className="text-gray-900 dark:text-gray-100">
                                    Important:
                                </strong>{' '}
                                All local storage data remains on your device and is never
                                transmitted to our servers.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Cookies
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                We use cookies to enhance your experience:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mt-2">
                                <li>
                                    <strong>Essential Cookies:</strong> Required for the site to
                                    function
                                </li>
                                <li>
                                    <strong>Preference Cookies:</strong> Remember your settings
                                </li>
                                <li>
                                    <strong>Analytics Cookies:</strong> Help us improve our services
                                </li>
                            </ul>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="how-we-use-information"
                    title="How We Use Your Information"
                    description="We use information to provide, maintain, and improve our services."
                >
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                        <li>Providing and maintaining our tools</li>
                        <li>Improving and developing new features</li>
                        <li>Analyzing usage patterns to optimize performance</li>
                        <li>Detecting and addressing technical issues</li>
                        <li>Responding to your inquiries</li>
                    </ul>
                </PageSection>

                <PageSection
                    id="data-processing"
                    title="Data Processing and Location"
                    description="Client-side processing ensures your data stays private."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                All Processing is Local
                            </h3>
                            <p>
                                All data processing happens directly in your browser. Your data
                                never leaves your device unless you explicitly choose to share it.
                                This includes JSON parsing, text comparison, branch name generation,
                                and all other tool operations.
                            </p>
                        </div>

                        <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                No Server Upload: Unlike many online tools, we do not upload your
                                data to our servers. Your information stays private and secure on
                                your device.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="third-party-services"
                    title="Third-Party Services"
                    description="We use limited third-party services to operate our platform."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>We may use third-party services such as:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Analytics services (e.g., Google Analytics)</li>
                            <li>Content delivery networks</li>
                            <li>Error tracking services</li>
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            These third parties have access to your data only to perform specific
                            tasks on our behalf and are obligated not to disclose or use it for any
                            other purpose.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="data-security"
                    title="Data Security"
                    description="We implement security measures to protect your information."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>We implement appropriate security measures, including:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>HTTPS encryption for all data transmission</li>
                            <li>Secure hosting infrastructure</li>
                            <li>Regular security updates and monitoring</li>
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            However, no method of transmission over the internet is 100% secure.
                            While we strive to protect your data, we cannot guarantee absolute
                            security.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="your-rights"
                    title="Your Rights and Choices"
                    description="You have certain rights regarding your personal data."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>Depending on your location, you may have the following rights:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>
                                <strong>Access:</strong> Request a copy of the data we hold about
                                you
                            </li>
                            <li>
                                <strong>Correction:</strong> Request correction of inaccurate data
                            </li>
                            <li>
                                <strong>Deletion:</strong> Request deletion of your personal data
                            </li>
                            <li>
                                <strong>Objection:</strong> Object to processing of your data
                            </li>
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            To exercise these rights, please contact us using the information below.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Have questions about this Privacy Policy? Get in touch."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            If you have any questions, concerns, or requests regarding this Privacy
                            Policy or our data practices, please contact us:
                        </p>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                Email: legal@devtools.com
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                We&apos;ll respond to your inquiry within 30 days.
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
