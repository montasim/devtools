'use client';

import Link from 'next/link';
import {
    ArrowRight,
    Terminal,
    Braces,
    Zap,
    Shield,
    Sparkles,
    Lock,
    Hash,
    Binary,
    Code2,
    Pipette,
    Fingerprint,
    KeyRound,
    Globe,
    FileJson,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/use-in-view';
import { TOOL_CATEGORIES, FEATURES } from '@/config/home-tools';
import type { LucideIcon } from 'lucide-react';

function AnimatedSection({
    children,
    className = '',
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const { ref, isInView } = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all ${className}`}
            style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(24px)',
                transitionDuration: '700ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

const QUICK_TOOLS: { icon: LucideIcon; label: string; href: string; color: string }[] = [
    { icon: FileJson, label: 'JSON', href: '/json', color: 'text-amber-500' },
    { icon: Binary, label: 'Base64', href: '/base64', color: 'text-blue-500' },
    { icon: Hash, label: 'Hash', href: '/hash', color: 'text-emerald-500' },
    { icon: Code2, label: 'cURL', href: '/curl', color: 'text-purple-500' },
    { icon: Pipette, label: 'Color', href: '/color', color: 'text-pink-500' },
    { icon: Globe, label: 'API', href: '/api-builder', color: 'text-cyan-500' },
    { icon: Fingerprint, label: 'UUID', href: '/id', color: 'text-orange-500' },
    { icon: KeyRound, label: 'RSA', href: '/rsa-key', color: 'text-rose-500' },
    { icon: Braces, label: 'Regex', href: '/regex', color: 'text-teal-500' },
    { icon: Lock, label: 'Bcrypt', href: '/password-hash', color: 'text-indigo-500' },
    { icon: Sparkles, label: 'QR', href: '/qrcode', color: 'text-yellow-500' },
    { icon: FileText, label: 'Markdown', href: '/markdown', color: 'text-lime-600' },
];

function HeroSection() {
    return (
        <section className="relative overflow-hidden border-b">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-3xl animate-pulse [animation-delay:2s]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex flex-col items-center py-16 sm:py-20 lg:py-24">
                    <AnimatedSection delay={0}>
                        <Badge
                            variant="outline"
                            className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium"
                        >
                            <Zap className="h-3 w-3 text-primary" />
                            30+ Developer Tools &mdash; No Sign-up Required
                        </Badge>
                    </AnimatedSection>

                    <AnimatedSection delay={80}>
                        <h1 className="mb-4 text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Developer tools that{' '}
                            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                                just work
                            </span>
                        </h1>
                    </AnimatedSection>

                    <AnimatedSection delay={160}>
                        <p className="mx-auto mb-8 max-w-xl text-center text-base text-muted-foreground sm:text-lg">
                            Format JSON, test APIs, generate hashes, build QR codes &mdash;
                            everything runs in your browser. No installs, no accounts, no data
                            leaves your machine.
                        </p>
                    </AnimatedSection>

                    <AnimatedSection delay={240}>
                        <div className="mb-10 flex items-center gap-3">
                            <Button size="lg" asChild className="h-11 px-6 text-sm">
                                <Link href="/json">
                                    <Braces className="mr-2 h-4 w-4" />
                                    Start Using &mdash; Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="h-11 px-6 text-sm"
                            >
                                <Link href="/docs">
                                    <Terminal className="mr-2 h-4 w-4" />
                                    Docs
                                </Link>
                            </Button>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={320}>
                        <div className="w-full max-w-2xl">
                            <div className="rounded-xl border bg-card/50 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        Everything runs locally &mdash; your data never leaves the
                                        browser
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                                    {QUICK_TOOLS.map((tool) => (
                                        <Link
                                            key={tool.href}
                                            href={tool.href}
                                            className="group flex flex-col items-center gap-1.5 rounded-lg border bg-background/50 px-2 py-2.5 transition-all hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-0.5"
                                        >
                                            <tool.icon className={`h-4 w-4 ${tool.color}`} />
                                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                                                {tool.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={400}>
                        <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground sm:gap-10">
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                <span>
                                    <span className="font-semibold text-foreground">30+</span> Tools
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                <span>
                                    <span className="font-semibold text-foreground">100%</span>{' '}
                                    Client-side
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                <span>
                                    <span className="font-semibold text-foreground">0</span> Setup
                                </span>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
}

function CategoryHeader({
    title,
    icon: Icon,
    index,
}: {
    title: string;
    icon: LucideIcon;
    index: number;
}) {
    return (
        <AnimatedSection delay={index * 100}>
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            </div>
        </AnimatedSection>
    );
}

function ToolCard({
    tool,
    index,
}: {
    tool: {
        href: string;
        label: string;
        description: string;
        icon: LucideIcon;
        featured?: boolean;
    };
    index: number;
}) {
    const Icon = tool.icon;
    return (
        <AnimatedSection delay={index * 60}>
            <Link
                href={tool.href}
                className={`group relative flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${
                    tool.featured ? 'border-primary/20 ring-1 ring-primary/5' : ''
                }`}
            >
                {tool.featured && (
                    <span className="absolute -top-2 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                        Popular
                    </span>
                )}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                </div>
                <h4 className="mb-1 font-semibold leading-tight">{tool.label}</h4>
                <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                </p>
                <div className="flex items-center text-sm font-medium text-primary/70 transition-colors group-hover:text-primary">
                    Try it now
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
            </Link>
        </AnimatedSection>
    );
}

function ToolsSection() {
    return (
        <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <AnimatedSection>
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Your complete developer toolkit
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Stop Googling for that one online tool. Everything you reach for daily
                            is right here, organized and ready.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="space-y-14">
                    {TOOL_CATEGORIES.map((category, catIndex) => (
                        <div key={category.title}>
                            <CategoryHeader
                                title={category.title}
                                icon={category.icon}
                                index={catIndex}
                            />
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {category.tools.map((tool, toolIndex) => (
                                    <ToolCard key={tool.href} tool={tool} index={toolIndex} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    return (
        <section className="border-t bg-gradient-to-b from-muted/20 to-muted/40 py-16 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <AnimatedSection>
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Why developers keep coming back
                        </h2>
                        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                            No friction, no compromises. Just tools that work the way you expect.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((feature, index) => (
                        <AnimatedSection key={feature.title} delay={index * 100}>
                            <div className="group rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    return (
        <section className="border-t py-16 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
                <AnimatedSection>
                    <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-10 sm:p-16">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Bookmark this page. You&apos;ll need it.
                        </h2>
                        <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                            Every tool is free, requires zero setup, and works offline. Add it to
                            your workflow today &mdash; you&apos;ll wonder how you worked without
                            it.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" asChild className="h-12 px-8 text-base">
                                <Link href="/json">
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                asChild
                                className="h-12 px-8 text-base"
                            >
                                <Link href="/docs">View Documentation</Link>
                            </Button>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}

export function AnimatedHomeContent() {
    return (
        <>
            <HeroSection />
            <ToolsSection />
            <FeaturesSection />
            <CtaSection />
        </>
    );
}
