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
                description="We built these tools so your data never has to leave your browser"
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
                    description="We don't just respect your privacy — we designed the entire product around it."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Most online tools upload your data to a server you can&apos;t see. We
                            took a different approach: everything runs in your browser. This policy
                            explains what little information we do collect, and more importantly,
                            what we don&apos;t.
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                The bottom line: Your data stays on your device. We literally
                                can&apos;t see it, and we wouldn&apos;t want to even if we could.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="information-we-collect"
                    title="Information We Collect"
                    description="Very little — and nothing you type into our tools."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">
                                Basic Device Info (Automatic)
                            </h3>
                            <p className="mb-2">
                                Like most websites, we receive standard information your browser
                                sends automatically:
                            </p>
                            <ul className="ml-4 list-inside list-disc space-y-1">
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Screen resolution</li>
                                <li>Language and region settings</li>
                            </ul>
                            <p className="mt-2 text-sm">
                                This helps us fix bugs and ensure the site works on your setup. It
                                tells us nothing about you personally.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">
                                Local Storage (On Your Device Only)
                            </h3>
                            <p>
                                We save your preferences and recent inputs locally so you don&apos;t
                                have to re-enter them every visit:
                            </p>
                            <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                                <li>Recent tool usage history</li>
                                <li>Preferences and settings</li>
                                <li>Input data for quick access</li>
                            </ul>
                            <p className="mt-2 text-sm">
                                <strong>This data lives in your browser and nowhere else.</strong>{' '}
                                You can clear it anytime from your browser settings.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">Cookies</h3>
                            <p>A small number of cookies keep the site working smoothly:</p>
                            <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
                                <li>
                                    <strong>Essential:</strong> Required for login and core
                                    functionality
                                </li>
                                <li>
                                    <strong>Preferences:</strong> Remember your settings between
                                    visits
                                </li>
                                <li>
                                    <strong>Analytics:</strong> Help us understand how the site is
                                    used so we can make it better
                                </li>
                            </ul>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="how-we-use-information"
                    title="How We Use Your Information"
                    description="Only to keep things running and getting better — never to profile or sell."
                >
                    <div className="space-y-3 text-muted-foreground">
                        <p>
                            The limited information we collect serves one purpose: making these
                            tools better for you. Here&apos;s exactly what we use it for:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Fixing bugs:</strong> When something breaks, device info
                                helps us reproduce and fix it faster
                            </li>
                            <li>
                                <strong>Building what you need:</strong> Usage patterns tell us
                                which tools are most useful so we prioritize the right features
                            </li>
                            <li>
                                <strong>Performance:</strong> We monitor load times and errors to
                                keep things fast
                            </li>
                            <li>
                                <strong>Responding to you:</strong> If you reach out, we use your
                                message to help
                            </li>
                        </ul>
                        <p className="text-sm">
                            What we <strong>don&apos;t</strong> do: sell your data, serve targeted
                            ads, build user profiles, or share information with data brokers.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="data-processing"
                    title="Data Processing and Location"
                    description="Your data doesn't travel — it stays right where you are."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <div>
                            <h3 className="mb-2 text-lg font-semibold">
                                Everything Happens in Your Browser
                            </h3>
                            <p>
                                When you paste JSON, generate a hash, or convert a file, that
                                processing happens on <strong>your device</strong>. The data you
                                input into any tool is never uploaded to our servers unless you
                                explicitly trigger an action that requires it (like shortening a
                                URL).
                            </p>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Unlike most online tools, we can&apos;t see what you type, paste, or
                                upload &mdash; because it never reaches our servers. Your inputs and
                                outputs exist only on your machine.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="third-party-services"
                    title="Third-Party Services"
                    description="A short list of services we rely on — and why."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We keep third-party dependencies to a minimum. Here are the only
                            external services involved:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Analytics</strong> (e.g., Google Analytics) &mdash; to
                                understand general traffic patterns, not individual users
                            </li>
                            <li>
                                <strong>Content delivery network</strong> &mdash; to serve the site
                                fast regardless of your location
                            </li>
                            <li>
                                <strong>Error tracking</strong> &mdash; to catch and fix bugs before
                                they affect you
                            </li>
                        </ul>
                        <p className="text-sm">
                            These services only receive the minimum data needed to do their job.
                            They are contractually obligated not to use it for anything else.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="data-security"
                    title="Data Security"
                    description="The best security is not having the data in the first place."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We can&apos;t lose what we don&apos;t have. Since your tool inputs never
                            reach our servers, they can&apos;t be leaked, hacked, or misused from
                            our end. For the limited data we do handle:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>
                                All connections are encrypted with HTTPS &mdash; your traffic
                                can&apos;t be intercepted
                            </li>
                            <li>Our hosting infrastructure receives regular security updates</li>
                            <li>We monitor for vulnerabilities continuously</li>
                        </ul>
                        <p className="text-sm">
                            That said, no system is perfect. If you ever discover a security
                            concern, please let us know and we&apos;ll address it immediately.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="your-rights"
                    title="Your Rights and Choices"
                    description="It's your data — you decide what happens with it."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Depending on where you live, you may have legal rights over your
                            personal data. We support all of them:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>See what we have:</strong> Request a copy of any personal
                                data we hold about you
                            </li>
                            <li>
                                <strong>Fix what&apos;s wrong:</strong> Ask us to correct inaccurate
                                information
                            </li>
                            <li>
                                <strong>Delete it all:</strong> Request full deletion of your
                                personal data &mdash; no questions asked
                            </li>
                            <li>
                                <strong>Say no:</strong> Object to processing of your data for
                                specific purposes
                            </li>
                        </ul>
                        <p className="text-sm">
                            To exercise any of these rights, reach out using the contact details
                            below. We aim to respond within 30 days.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Questions? Concerns? We're here."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            If anything in this policy is unclear, or you want to exercise your data
                            rights, don&apos;t hesitate to reach out:
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
