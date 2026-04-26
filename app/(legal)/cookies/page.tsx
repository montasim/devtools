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
import { siteLinks } from '@/config/seo';

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
                description="A no-surprises look at the few cookies we use and why"
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
                    description="Most sites bury this page. We wrote it to be actually useful."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We use a small number of cookies to keep DevTools working smoothly and
                            remember your preferences between visits. No more, no less.
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Zero advertising cookies. Zero cross-site tracking. We only use
                                cookies to make your experience better &mdash; not to follow you
                                around the internet.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="what-are-cookies"
                    title="What Are Cookies"
                    description="A quick explainer — skip this if you already know."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            Cookies are tiny text files your browser saves when you visit a website.
                            Think of them like a sticky note your browser leaves for itself &mdash;
                            &ldquo;this user prefers dark mode&rdquo; or &ldquo;this session is
                            still active.&rdquo;
                        </p>
                        <p>
                            We also use <strong>local storage</strong> and{' '}
                            <strong>session storage</strong>, which work like cookies but can
                            remember more. That&apos;s how your tool inputs and history survive a
                            page refresh.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="how-we-use"
                    title="How We Use Cookies"
                    description="Every cookie we set has a specific job — nothing sneaky."
                >
                    <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
                        <li>
                            <strong>Keep you logged in</strong> &mdash; so you don&apos;t have to
                            sign in on every page
                        </li>
                        <li>
                            <strong>Remember your preferences</strong> &mdash; theme, layout, and
                            tool settings stay the way you left them
                        </li>
                        <li>
                            <strong>Save your work</strong> &mdash; tool inputs and history are
                            stored locally so nothing&apos;s lost if you accidentally close the tab
                        </li>
                        <li>
                            <strong>Make things faster</strong> &mdash; analytics (anonymized) help
                            us find bottlenecks and fix them
                        </li>
                    </ul>
                </PageSection>

                <PageSection
                    id="types-of-cookies"
                    title="Types of Cookies We Use"
                    description="Just three categories — and not a single ad tracker among them."
                >
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                        E
                                    </span>
                                </div>
                                <h3 className="font-semibold">
                                    Essential Cookies{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        (can&apos;t turn these off)
                                    </span>
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                These keep the site working &mdash; session tokens, login state, and
                                security features. Without them, DevTools can&apos;t remember
                                you&apos;re logged in from one page to the next.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        F
                                    </span>
                                </div>
                                <h3 className="font-semibold">
                                    Functional Cookies{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        (nice to have)
                                    </span>
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your theme preference, layout choices, and tool configurations. The
                                site works without them, but you&apos;d have to re-set everything
                                every visit.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-background p-5">
                            <div className="mb-2 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                        A
                                    </span>
                                </div>
                                <h3 className="font-semibold">
                                    Analytics Cookies{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        (fully anonymized)
                                    </span>
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Anonymized data about which tools get used most and where things are
                                slow. We use this to decide what to improve &mdash; not to build a
                                profile on you.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="managing-cookies"
                    title="Managing Your Cookie Preferences"
                    description="It's your browser — you're in charge."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            You can block, delete, or limit cookies anytime through your browser
                            settings. Here&apos;s how:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2">
                            <li>
                                <strong>Browser settings:</strong> Every major browser lets you
                                block or delete cookies in its preferences
                            </li>
                            <li>
                                <strong>Analytics opt-out:</strong> Use browser extensions to opt
                                out of analytics tracking if you prefer
                            </li>
                            <li>
                                <strong>Nuclear option:</strong> Clear all browser data to wipe
                                everything &mdash; cookies, local storage, the lot
                            </li>
                        </ul>
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                Heads up: blocking essential cookies means DevTools won&apos;t be
                                able to keep you logged in or save your preferences. The tools will
                                still work, but you&apos;ll start fresh each visit.
                            </p>
                        </div>
                    </div>
                </PageSection>

                <PageSection
                    id="third-party"
                    title="Third-Party Cookies"
                    description="The short list of external cookies — and nothing from ad companies."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We don&apos;t allow third-party advertising cookies. Period. The only
                            external cookies that may appear come from:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-1">
                            <li>
                                <strong>Analytics</strong> &mdash; anonymized traffic data so we
                                know which tools to improve
                            </li>
                            <li>
                                <strong>CDN</strong> &mdash; delivers the site fast no matter where
                                you are
                            </li>
                        </ul>
                        <p className="text-sm">
                            These services may set their own cookies to function, but they
                            don&apos;t track you across other websites.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="updates"
                    title="Policy Updates"
                    description="If we change something, you'll see it here."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            We may update this policy when our practices change. When we do,
                            we&apos;ll update the date at the bottom of this page so you can tell
                            what&apos;s new.
                        </p>
                        <p className="text-sm">
                            We won&apos;t silently add advertising cookies or cross-site trackers.
                            If we ever change the type of cookies we use, you&apos;ll know.
                        </p>
                    </div>
                </PageSection>

                <PageSection
                    id="contact"
                    title="Contact Us"
                    description="Still have questions? We're happy to explain."
                >
                    <div className="space-y-4 text-muted-foreground">
                        <p>If anything about our cookie use is unclear, just ask:</p>
                        <div className="rounded-lg border bg-muted p-4">
                            <p className="font-medium">Email: {siteLinks.feedback}</p>
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
