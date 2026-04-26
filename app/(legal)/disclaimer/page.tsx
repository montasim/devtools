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
                description="What you should know before relying on these tools for important work"
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
                    description="Free tools built to help — but not to replace your professional judgment."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools is a free suite of browser-based utilities designed to speed up
                            common developer tasks &mdash; formatting JSON, hashing passwords,
                            testing regex, converting units, and more. Think of us as a fast first
                            step, not the final word.
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                These tools are built with care and tested thoroughly, but
                                they&apos;re not a substitute for professional review. Always verify
                                results before using them in production.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="no-warranty"
                    title="No Warranty"
                    description="We stand behind our work, but the law requires us to say this."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools is provided &quot;as is&quot; and &quot;as available.&quot;
                            While we work hard to make every tool reliable, we can&apos;t guarantee:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>The service will never have bugs or downtime</li>
                            <li>Results will be perfect in every edge case</li>
                            <li>The tools will fit every specific requirement you have</li>
                        </ul>
                        <p className="text-sm">
                            What we <em>can</em> promise: when something breaks, we fix it fast. And
                            since everything runs in your browser, your data is never at risk from a
                            server-side bug.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="accuracy"
                    title="Accuracy of Results"
                    description="Double-check before you ship — your future self will thank you."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We test every tool against known inputs and outputs. But real-world data
                            can be unpredictable &mdash; unusual characters, massive files, or edge
                            cases we haven&apos;t encountered yet can produce unexpected results.
                        </p>
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                Golden rule: Verify before you trust. A 5-second sanity check on the
                                output can save you hours of debugging later. This is good practice
                                with <em>any</em> tool, not just ours.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="use-at-risk"
                    title="Use at Your Own Risk"
                    description="Great for everyday tasks. Use extra caution with sensitive data."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools is perfect for everyday developer tasks &mdash; formatting,
                            converting, generating, and debugging. But use your judgment when the
                            stakes are high.
                        </p>
                        <p>
                            Although all processing happens <strong>locally in your browser</strong>{' '}
                            and nothing is sent to our servers, we still recommend caution with
                            highly sensitive or classified information. Your browser, your device
                            security, and your environment are factors only you can assess.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="third-party-links"
                    title="Third-Party Links and Services"
                    description="We link to helpful things — but we don't control what's on the other side."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            From time to time, DevTools may link to external websites or services.
                            We&apos;re not responsible for what happens on those sites &mdash; their
                            content, privacy practices, or uptime is outside our control.
                        </p>
                        <p className="text-sm">
                            A link doesn&apos;t mean we endorse everything on that site. Apply the
                            same scrutiny you&apos;d use anywhere else on the internet.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="availability"
                    title="Service Availability"
                    description="We aim for always-on, but real life happens."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We keep DevTools running around the clock, but occasional downtime is
                            unavoidable. The site may be briefly unavailable for:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>Updates that make the tools better</li>
                            <li>Unexpected technical issues (we fix these fast)</li>
                            <li>External dependencies outside our control</li>
                        </ul>
                        <p className="text-sm">
                            Here&apos;s the good news: since everything runs in your browser, an
                            outage mainly affects loading the page. If you already have a tool open,
                            it keeps working even if the server goes down.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="limitation"
                    title="Limitation of Liability"
                    description="Free tools mean reasonable limits on what we're liable for."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            DevTools is a free service. Because we don&apos;t charge you anything,
                            our liability is limited to the maximum extent allowed by law.
                            We&apos;re not liable for:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>Losses from using (or not being able to use) the tools</li>
                            <li>
                                Errors in tool outputs &mdash; which is why we keep reminding you to
                                verify
                            </li>
                            <li>Issues caused by your browser, device, or network</li>
                        </ul>
                        <p className="text-sm">
                            In plain terms: we give you free, carefully built tools that run on your
                            machine. If something goes sideways, we&apos;ll help however we can
                            &mdash; but we can&apos;t take on risk that exceeds the price you paid
                            (which is zero).
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Found an issue? Have a question? We're here."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            If you spot an inaccuracy, run into an edge case, or just want to ask
                            about something in this disclaimer:
                        </p>
                        <div className="rounded-lg border bg-muted p-4">
                            <p className="font-medium">Email: legal@devtools.com</p>
                            <p className="mt-1 text-sm">
                                We respond to every inquiry within 30 days.
                            </p>
                        </div>
                        <p className="text-xs">Last updated: January 1, 2025</p>
                    </div>
                </PageSection>
            </PageContent>
        </PageLayout>
    );
}
