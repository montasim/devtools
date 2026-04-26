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
                description="The straightforward rules for using our free tools — written for humans, not lawyers"
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
                    description="Using our tools means you're okay with these straightforward rules."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            By using DevTools, you&apos;re agreeing to a simple deal: we provide
                            free tools that respect your privacy, and you use them responsibly.
                            That&apos;s it.
                        </p>
                        <p>
                            These terms exist to protect both of us. If any part doesn&apos;t work
                            for you, you&apos;re free to stop using the service at any time.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="service"
                    title="What We Provide"
                    description="Free, browser-based developer tools — no installs, no accounts, no catch."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools is a free suite of 30+ browser-based utilities for developers.
                            Everything runs locally in your browser:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>JSON formatting, validation, diffing, and transformation</li>
                            <li>Text comparison, cleaning, and case conversion</li>
                            <li>Base64, URL, and HTML entity encoding/decoding</li>
                            <li>Hashing, password generation, and cryptography</li>
                            <li>Network tools, reference tables, and more</li>
                        </ul>
                        <p className="text-sm">
                            We do our best to keep things running smoothly, but like any free
                            service, we can&apos;t promise 100% uptime. We may occasionally update,
                            pause, or change features as we improve things.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="responsibilities"
                    title="Your Responsibilities"
                    description="A short, reasonable list — mostly common sense."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We keep the rules simple because we trust you to use good judgment.
                            Just:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Use the tools lawfully</strong> &mdash; don&apos;t do
                                anything illegal with them
                            </li>
                            <li>
                                <strong>Play fair</strong> &mdash; don&apos;t try to break,
                                overload, or hack the service
                            </li>
                            <li>
                                <strong>Be respectful</strong> &mdash; these tools are shared by
                                everyone
                            </li>
                        </ul>
                        <p className="text-sm">
                            In short: use DevTools the way you&apos;d want others to use a service
                            you built.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="intellectual-property"
                    title="Intellectual Property"
                    description="Your data is yours. Our code is ours. Simple."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            The DevTools platform, its design, and its source code belong to
                            DevTools and are protected by copyright and intellectual property laws.
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                What you put in, stays yours. Any text, JSON, files, or other data
                                you input into our tools remains 100% your property. We process it
                                only to give you the result you asked for &mdash; nothing more.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="disclaimer"
                    title="Disclaimer of Warranties"
                    description="We built these tools carefully, but use professional judgment for critical work."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We build these tools with care and test them thoroughly, but
                            they&apos;re provided &quot;as is&quot; and &quot;as available&quot;
                            &mdash; without formal warranties. Specifically:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>Results are not guaranteed to be error-free</li>
                            <li>Tools may not fit every specific use case</li>
                            <li>Service may occasionally be unavailable</li>
                        </ul>
                        <p className="text-sm">
                            <strong>Practical advice:</strong> For production code,
                            security-sensitive operations, or legal/compliance work, always
                            double-check results with your own verification. These tools are a fast
                            starting point, not a substitute for professional review.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="liability"
                    title="Limitation of Liability"
                    description="Free tools come with reasonable limits on our liability."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Since DevTools is free and all processing happens in your browser, our
                            liability is limited to the maximum extent permitted by law. We&apos;re
                            not liable for indirect, incidental, or consequential damages.
                        </p>
                        <p className="text-sm">
                            In plain terms: we give you free tools that run on your machine. If
                            something goes wrong, we&apos;ll do our best to help &mdash; but we
                            can&apos;t be held responsible for losses beyond our control.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="termination"
                    title="Termination"
                    description="You can stop anytime. We can too, if the rules are broken."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            You can stop using DevTools at any time &mdash; no notice needed, no
                            strings attached.
                        </p>
                        <p>
                            On our end, we may restrict access if these terms are violated, but
                            that&apos;s a last resort we&apos;ve never needed to use.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Questions about these terms? We're happy to clarify."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            If anything in these terms is unclear or you want to discuss them, reach
                            out:
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
