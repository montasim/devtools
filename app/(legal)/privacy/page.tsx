'use client';

import { useMemo } from 'react';
import { Shield } from 'lucide-react';
import {
    PageLayout,
    PageHeader,
    SidebarNav,
    PageSection,
    PageContent,
    MobileNav,
} from '@/components/page-content';
import { useScrollSpy } from '@/hooks/use-scroll-spy';

const privacySections = [
    { id: 'introduction', title: 'Introduction', icon: <Shield className="h-5 w-5" /> },
    {
        id: 'information-we-collect',
        title: 'Information We Collect',
        icon: <Shield className="h-5 w-5" />,
    },
    {
        id: 'how-we-use-information',
        title: 'How We Use Information',
        icon: <Shield className="h-5 w-5" />,
    },
    {
        id: 'data-processing',
        title: 'Data Processing',
        icon: <Shield className="h-5 w-5" />,
    },
    {
        id: 'third-party-services',
        title: 'Third-Party Services',
        icon: <Shield className="h-5 w-5" />,
    },
    { id: 'data-security', title: 'Data Security', icon: <Shield className="h-5 w-5" /> },
    { id: 'your-rights', title: 'Your Rights', icon: <Shield className="h-5 w-5" /> },
    { id: 'contact', title: 'Contact Us', icon: <Shield className="h-5 w-5" /> },
];

export default function PrivacyPolicyPage() {
    const sections = useMemo(() => privacySections, []);
    const { activeSection, scrollToSection } = useScrollSpy(sections);

    return (
        <PageLayout>
            <PageHeader
                icon={<Shield className="h-6 w-6 text-white" />}
                title="Privacy Policy"
                description="Learn how DevTools protects your data with client-side processing"
            />
            <PageContent
                sidebar={
                    <SidebarNav
                        sections={sections}
                        activeSection={activeSection}
                        onSectionClick={scrollToSection}
                    />
                }
                mobileNav={
                    <MobileNav
                        sections={sections}
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            At DevTools, we take your privacy seriously. This Privacy Policy
                            explains how we collect, use, disclose, and safeguard your information
                            when you use our free online developer tools.
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
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
                    <div className="space-y-4 text-muted-foreground">
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">
                                Device and Browser Information
                            </h3>
                            <ul className="ml-4 list-inside list-disc space-y-1">
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Screen resolution</li>
                                <li>Language and region settings</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">Local Storage Data</h3>
                            <p>
                                Our tools store data locally in your browser for your convenience:
                            </p>
                            <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                                <li>Recent tool usage history</li>
                                <li>Preferences and settings</li>
                                <li>Input data for quick access</li>
                            </ul>
                            <p className="mt-2 text-sm">
                                <strong>Important:</strong> All local storage data remains on your
                                device and is never transmitted to our servers.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">Cookies</h3>
                            <p>We use cookies to enhance your experience:</p>
                            <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
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
                    <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
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
                    <div className="space-y-4 text-muted-foreground">
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">All Processing is Local</h3>
                            <p>
                                All data processing happens directly in your browser. Your data
                                never leaves your device unless you explicitly choose to share it.
                            </p>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>We may use third-party services such as:</p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>Analytics services (e.g., Google Analytics)</li>
                            <li>Content delivery networks</li>
                            <li>Error tracking services</li>
                        </ul>
                        <p className="text-sm">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>We implement appropriate security measures, including:</p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>HTTPS encryption for all data transmission</li>
                            <li>Secure hosting infrastructure</li>
                            <li>Regular security updates and monitoring</li>
                        </ul>
                        <p className="text-sm">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>Depending on your location, you may have the following rights:</p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
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
                        <p className="text-sm">
                            To exercise these rights, please contact us using the information below.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Have questions about this Privacy Policy? Get in touch."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            If you have any questions, concerns, or requests regarding this Privacy
                            Policy or our data practices, please contact us:
                        </p>
                        <div className="rounded-lg border bg-muted p-4">
                            <p className="font-medium">Email: legal@devtools.com</p>
                            <p className="mt-1 text-sm">
                                We&apos;ll respond to your inquiry within 30 days.
                            </p>
                        </div>
                        <p className="text-xs">Last updated: January 1, 2025</p>
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
