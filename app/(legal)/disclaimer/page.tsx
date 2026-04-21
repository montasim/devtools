'use client';

import { useMemo } from 'react';
import { Scale } from 'lucide-react';
import {
    PageLayout,
    PageHeader,
    SidebarNav,
    PageSection,
    PageContent,
    MobileNav,
} from '@/components/page-content';
import { useScrollSpy } from '@/hooks/use-scroll-spy';

const disclaimerSections = [
    { id: 'general', title: 'General Disclaimer', icon: <Scale className="h-5 w-5" /> },
    { id: 'no-warranty', title: 'No Warranty', icon: <Scale className="h-5 w-5" /> },
    { id: 'accuracy', title: 'Accuracy of Results', icon: <Scale className="h-5 w-5" /> },
    { id: 'use-at-risk', title: 'Use at Your Own Risk', icon: <Scale className="h-5 w-5" /> },
    { id: 'third-party-links', title: 'Third-Party Links', icon: <Scale className="h-5 w-5" /> },
    { id: 'availability', title: 'Service Availability', icon: <Scale className="h-5 w-5" /> },
    { id: 'limitation', title: 'Limitation of Liability', icon: <Scale className="h-5 w-5" /> },
    { id: 'contact', title: 'Contact Us', icon: <Scale className="h-5 w-5" /> },
];

export default function DisclaimerPage() {
    const sections = useMemo(() => disclaimerSections, []);
    const { activeSection, scrollToSection } = useScrollSpy(sections);

    return (
        <PageLayout>
            <PageHeader
                icon={<Scale className="h-6 w-6 text-white" />}
                title="Disclaimer"
                description="Important legal information about the use of DevTools"
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
                    id="general"
                    title="General Disclaimer"
                    description="Important information about the nature of DevTools services."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools provides free, web-based developer utilities for JSON, text,
                            and Base64 processing. The tools are designed to assist developers in
                            their day-to-day workflows.
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Please read this disclaimer carefully before using our services. By
                                using DevTools, you acknowledge and agree to the terms outlined
                                below.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="no-warranty"
                    title="No Warranty"
                    description='DevTools is provided "as is" without any warranties.'
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools and all its tools are provided on an &quot;AS IS&quot; and
                            &quot;AS AVAILABLE&quot; basis without any representations or warranties
                            of any kind, either express or implied.
                        </p>
                        <p>We do not warrant that:</p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>The services will be uninterrupted or error-free</li>
                            <li>
                                The results obtained from using the tools will be accurate or
                                reliable
                            </li>
                            <li>Any defects in the services will be corrected</li>
                            <li>The services will meet your specific requirements</li>
                        </ul>
                    </div>
                </PageSection>

                <PageSection
                    id="accuracy"
                    title="Accuracy of Results"
                    description="Verification of tool outputs is your responsibility."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            While we strive to ensure the accuracy and reliability of all our tools,
                            the results produced may not always be perfect. Factors such as input
                            complexity, edge cases, and browser limitations can affect output
                            quality.
                        </p>
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                Always verify: You are responsible for verifying the accuracy of any
                                results produced by our tools before using them in production
                                environments.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="use-at-risk"
                    title="Use at Your Own Risk"
                    description="You assume all risks associated with using DevTools."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Your use of DevTools and its tools is at your sole risk. You are
                            responsible for ensuring that any data you process through our tools is
                            appropriate for the intended purpose.
                        </p>
                        <p>
                            We recommend against using DevTools for processing highly sensitive or
                            classified information. Although all processing happens locally in your
                            browser, you should exercise caution with confidential data.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="third-party-links"
                    title="Third-Party Links and Services"
                    description="We are not responsible for external content."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools may contain links to third-party websites or services. We are
                            not responsible for the content, privacy policies, or practices of any
                            third-party websites.
                        </p>
                        <p className="text-sm">
                            The inclusion of any link does not imply endorsement. We strongly advise
                            you to review the terms and privacy policies of any third-party sites
                            you visit.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="availability"
                    title="Service Availability"
                    description="We do not guarantee uninterrupted access."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We strive to keep DevTools available 24/7, but we do not guarantee
                            uninterrupted access. Services may be temporarily unavailable due to:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>Scheduled maintenance and updates</li>
                            <li>Unforeseen technical issues</li>
                            <li>Third-party service outages</li>
                            <li>Force majeure events</li>
                        </ul>
                        <p className="text-sm">
                            We will make reasonable efforts to notify users of planned downtime when
                            possible.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="limitation"
                    title="Limitation of Liability"
                    description="Our liability is limited as described below."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            In no event shall DevTools, its developers, or its affiliates be liable
                            for any direct, indirect, incidental, special, consequential, or
                            punitive damages arising from:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>Your use of or inability to use the services</li>
                            <li>Any errors or inaccuracies in tool outputs</li>
                            <li>Unauthorized access to or alteration of your data</li>
                            <li>Any other matter relating to the services</li>
                        </ul>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Questions about this disclaimer?"
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            If you have any questions or concerns about this Disclaimer, please
                            contact us:
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
