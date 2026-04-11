'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
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

const termsSections: DocSection[] = [
    {
        id: 'agreement',
        title: 'Agreement',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'service',
        title: 'Service',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'responsibilities',
        title: 'User Responsibilities',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'disclaimer',
        title: 'Disclaimer',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'liability',
        title: 'Liability',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'termination',
        title: 'Termination',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'contact',
        title: 'Contact',
        icon: <FileText className="w-5 h-5" />,
    },
];

export default function TermsOfServicePage() {
    const [activeSection, setActiveSection] = useState('agreement');

    useEffect(() => {
        const handleScroll = () => {
            const sections = termsSections.map((section) => document.getElementById(section.id));
            const scrollPosition = window.scrollY + 100;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(termsSections[i].id);
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
                icon={<FileText className="w-6 h-6 text-white" />}
                title="Terms of Service"
                description="Terms and conditions governing your use of DevTools services"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={termsSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
                mobileNav={
                    <MobileNav
                        sections={termsSections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
            >
                <PageSection
                    id="agreement"
                    title="Agreement to Terms"
                    description="By using DevTools, you agree to these terms."
                >
                    <p className="text-gray-700 dark:text-gray-300">
                        By accessing or using DevTools, you agree to be bound by these Terms of
                        Service and all applicable laws and regulations. If you do not agree with
                        any of these terms, you are prohibited from using our services.
                    </p>
                </PageSection>

                <PageSection
                    id="service"
                    title="Description of Service"
                    description="Free online developer tools for your productivity."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>DevTools provides free online developer tools, including:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>JSON formatting, validation, and manipulation</li>
                            <li>Text comparison and processing</li>
                            <li>XML parsing and validation</li>
                            <li>CSV conversion and processing</li>
                            <li>Git branch name generation</li>
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            We strive to provide uninterrupted service but do not guarantee 100%
                            availability. We reserve the right to modify, suspend, or discontinue
                            any part of our service at any time without prior notice.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="responsibilities"
                    title="User Responsibilities"
                    description="As a user, you agree to use our services responsibly."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>You agree to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Use tools only for lawful purposes</li>
                            <li>Not attempt to gain unauthorized access</li>
                            <li>Not interfere with or disrupt services</li>
                            <li>Not introduce viruses or harmful code</li>
                            <li>Respect the rights of other users</li>
                        </ul>
                    </div>
                </PageSection>

                <PageSection
                    id="intellectual-property"
                    title="Intellectual Property Rights"
                    description="Ownership and usage rights of content and data."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            All content, features, and functionality of DevTools are owned by
                            DevTools and are protected by international copyright, trademark, and
                            other intellectual property laws.
                        </p>
                        <p>
                            You retain ownership of any data you input into our tools. By using our
                            services, you grant us a license to process your data solely to provide
                            the requested functionality.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="disclaimer"
                    title="Disclaimer of Warranties"
                    description='Services provided "as is" without warranties.'
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            DevTools is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
                            without warranties of any kind.
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>No warranty of merchantability</li>
                            <li>No warranty of fitness for a particular purpose</li>
                            <li>No warranty of accuracy or reliability of results</li>
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            We do not guarantee that our tools will meet your requirements, be
                            uninterrupted, timely, secure, or error-free.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="liability"
                    title="Limitation of Liability"
                    description="Our liability is limited to the maximum extent permitted by law."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            DevTools shall not be liable for any indirect, incidental, special,
                            consequential, or punitive damages.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Since our services are free, our liability is limited to the maximum
                            extent permitted by applicable law.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="termination"
                    title="Termination"
                    description="We reserve the right to terminate access for violations."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            We may terminate or suspend your access immediately for breach of terms,
                            violation of laws, or abusive behavior.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upon termination, your right to use our services will immediately cease.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Have questions? Get in touch."
                >
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                            If you have questions about these Terms of Service, please contact us:
                        </p>
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
