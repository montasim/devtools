'use client';

import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import {
    PageLayout,
    PageHeader,
    SidebarNav,
    PageSection,
    PageContent,
    MobileNav,
} from '@/components/page-content';
import { useScrollSpy } from '@/hooks/use-scroll-spy';

const termsSections = [
    { id: 'agreement', title: 'Agreement', icon: <FileText className="h-5 w-5" /> },
    { id: 'service', title: 'Service', icon: <FileText className="h-5 w-5" /> },
    {
        id: 'responsibilities',
        title: 'User Responsibilities',
        icon: <FileText className="h-5 w-5" />,
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        icon: <FileText className="h-5 w-5" />,
    },
    { id: 'disclaimer', title: 'Disclaimer', icon: <FileText className="h-5 w-5" /> },
    { id: 'liability', title: 'Liability', icon: <FileText className="h-5 w-5" /> },
    { id: 'termination', title: 'Termination', icon: <FileText className="h-5 w-5" /> },
    { id: 'contact', title: 'Contact', icon: <FileText className="h-5 w-5" /> },
];

export default function TermsOfServicePage() {
    const sections = useMemo(() => termsSections, []);
    const { activeSection, scrollToSection } = useScrollSpy(sections);

    return (
        <PageLayout>
            <PageHeader
                icon={<FileText className="h-6 w-6 text-white" />}
                title="Terms of Service"
                description="Terms and conditions governing your use of DevTools services"
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
                    id="agreement"
                    title="Agreement to Terms"
                    description="By using DevTools, you agree to these terms."
                >
                    <p className="text-muted-foreground">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>DevTools provides free online developer tools, including:</p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>JSON formatting, validation, and manipulation</li>
                            <li>Text comparison and processing</li>
                            <li>Base64 encoding and decoding</li>
                        </ul>
                        <p className="text-sm">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>You agree to:</p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
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
                    <div className="space-y-4 text-muted-foreground">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;
                            without warranties of any kind.
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>No warranty of merchantability</li>
                            <li>No warranty of fitness for a particular purpose</li>
                            <li>No warranty of accuracy or reliability of results</li>
                        </ul>
                        <p className="text-sm">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools shall not be liable for any indirect, incidental, special,
                            consequential, or punitive damages.
                        </p>
                        <p className="text-sm">
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
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We may terminate or suspend your access immediately for breach of terms,
                            violation of laws, or abusive behavior.
                        </p>
                        <p className="text-sm">
                            Upon termination, your right to use our services will immediately cease.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Have questions? Get in touch."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            If you have questions about these Terms of Service, please contact us:
                        </p>
                        <div className="rounded-lg border bg-muted p-4">
                            <p className="font-medium">Email: legal@devtools.com</p>
                        </div>
                        <p className="text-xs">Last updated: January 1, 2025</p>
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
