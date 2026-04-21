'use client';

import { useMemo } from 'react';
import { Cookie } from 'lucide-react';
import {
    PageLayout,
    PageHeader,
    SidebarNav,
    PageSection,
    PageContent,
    MobileNav,
} from '@/components/page-content';
import { useScrollSpy } from '@/hooks/use-scroll-spy';

const cookieSections = [
    { id: 'introduction', title: 'Introduction', icon: <Cookie className="h-5 w-5" /> },
    { id: 'what-are-cookies', title: 'What Are Cookies', icon: <Cookie className="h-5 w-5" /> },
    { id: 'how-we-use', title: 'How We Use Cookies', icon: <Cookie className="h-5 w-5" /> },
    { id: 'types-of-cookies', title: 'Types of Cookies', icon: <Cookie className="h-5 w-5" /> },
    { id: 'managing-cookies', title: 'Managing Cookies', icon: <Cookie className="h-5 w-5" /> },
    { id: 'third-party', title: 'Third-Party Cookies', icon: <Cookie className="h-5 w-5" /> },
    { id: 'updates', title: 'Updates', icon: <Cookie className="h-5 w-5" /> },
    { id: 'contact', title: 'Contact Us', icon: <Cookie className="h-5 w-5" /> },
];

export default function CookiesPage() {
    const sections = useMemo(() => cookieSections, []);
    const { activeSection, scrollToSection } = useScrollSpy(sections);

    return (
        <PageLayout>
            <PageHeader
                icon={<Cookie className="h-6 w-6 text-white" />}
                title="Cookie Policy"
                description="Learn how DevTools uses cookies and similar technologies"
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
                    description="This Cookie Policy explains how DevTools uses cookies and similar tracking technologies."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            When you visit and use DevTools, certain cookies and tracking
                            technologies may be stored on your device. This policy explains what
                            they are, why we use them, and how you can manage your preferences.
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Your data matters: We use cookies minimally and only to enhance your
                                experience. No cookies are used for advertising or tracking across
                                sites.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="what-are-cookies"
                    title="What Are Cookies"
                    description="Understanding cookies and similar technologies."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Cookies are small text files that are stored on your device when you
                            visit a website. They are widely used to make websites work more
                            efficiently and to provide information to the owners of the site.
                        </p>
                        <p>
                            We also use similar technologies such as local storage and session
                            storage, which function similarly to cookies but offer more storage
                            capacity and flexibility.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="how-we-use"
                    title="How We Use Cookies"
                    description="The purposes for which we use cookies."
                >
                    <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
                        <li>
                            <strong>Essential functionality:</strong> To keep you logged in and
                            remember your preferences
                        </li>
                        <li>
                            <strong>Performance:</strong> To understand how visitors interact with
                            our tools so we can improve them
                        </li>
                        <li>
                            <strong>User experience:</strong> To remember your theme preference
                            (light/dark mode) and other settings
                        </li>
                        <li>
                            <strong>Data persistence:</strong> To save your tool inputs and history
                            locally for convenience
                        </li>
                    </ul>
                </PageSection>

                <PageSection
                    id="types-of-cookies"
                    title="Types of Cookies We Use"
                    description="Categories of cookies used on DevTools."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                        E
                                    </span>
                                </div>
                                <h3 className="font-semibold">Essential Cookies</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Required for the website to function properly. These cannot be
                                disabled. They include session tokens, authentication state, and
                                security features.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        F
                                    </span>
                                </div>
                                <h3 className="font-semibold">Functional Cookies</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enable personalized features such as theme preference, layout
                                settings, and tool configurations. These enhance your experience but
                                are not essential.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                        A
                                    </span>
                                </div>
                                <h3 className="font-semibold">Analytics Cookies</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Help us understand how visitors interact with our tools by
                                collecting anonymized data. This information is used solely to
                                improve our services.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="managing-cookies"
                    title="Managing Your Cookie Preferences"
                    description="You have control over how cookies are used."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            You can control and manage cookies in various ways. Keep in mind that
                            removing or blocking cookies may impact your user experience.
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Browser settings:</strong> Most browsers allow you to block
                                or delete cookies through their settings
                            </li>
                            <li>
                                <strong>Opt-out tools:</strong> Use analytics opt-out browser
                                extensions if available
                            </li>
                            <li>
                                <strong>Clear local storage:</strong> Clear your browser data to
                                remove all locally stored information
                            </li>
                        </ul>
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                Note: Disabling essential cookies may prevent certain features of
                                DevTools from functioning properly.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="third-party"
                    title="Third-Party Cookies"
                    description="Cookies set by external services."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We do not allow third-party advertising cookies on DevTools. Any
                            third-party services we use are limited to:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>Analytics providers (anonymized data only)</li>
                            <li>Content delivery networks for fast loading</li>
                        </ul>
                        <p className="text-sm">
                            These services may set their own cookies to function properly, but they
                            do not track you across other websites.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="updates"
                    title="Policy Updates"
                    description="We may update this policy from time to time."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We may update this Cookie Policy periodically to reflect changes in
                            technology, legislation, or our data practices. Any changes will be
                            posted on this page with an updated revision date.
                        </p>
                        <p className="text-sm">
                            We encourage you to review this policy regularly to stay informed about
                            how we use cookies.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Have questions about our use of cookies?"
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            If you have any questions about this Cookie Policy, please contact us:
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
