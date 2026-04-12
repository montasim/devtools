import Link from 'next/link';
import {
    ArrowRight,
    FileCode,
    Keyboard,
    Terminal,
    Shield,
    Zap,
    Sparkles,
    Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigationMenu } from '@/config/navigation';

const tools = navigationMenu.find((section) => section.title === 'Tools')?.items || [];

const features = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'All tools run locally in your browser. No server uploads, no waiting.',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Your data never leaves your browser. 100% client-side processing.',
    },
    {
        icon: Sparkles,
        title: 'Modern Design',
        description: 'Clean, intuitive interface with dark mode support and responsive layout.',
    },
    {
        icon: Heart,
        title: 'Free Forever',
        description: 'All tools are completely free with no sign-up required.',
    },
];

export default function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 px-4 py-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
                            <Terminal className="h-4 w-4" />
                            <span className="font-semibold">Developer Tools</span>
                        </div>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Powerful Tools for
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {' '}
                                Developers
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            A comprehensive suite of developer tools for formatting, validating, and
                            transforming data. All tools run locally in your browser for maximum
                            privacy and speed.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" asChild>
                                <Link href="/json">
                                    <FileCode className="mr-2 h-5 w-5" />
                                    Explore Tools
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/docs">Read Documentation</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tools Grid */}
            <section className="px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Essential Developer Tools
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Everything you need to work with JSON, text, XML, CSV, and more.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tools.map((tool) => (
                            <Link
                                key={tool.url}
                                href={tool.url}
                                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                                    {tool.icon}
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">{tool.title}</h3>
                                <p className="text-sm text-muted-foreground">{tool.description}</p>
                                <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:gap-2">
                                    Get Started
                                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Why Choose Our Tools?
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Built by developers, for developers. Every feature is designed with your
                            workflow in mind.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div key={feature.title} className="text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to Boost Your Productivity?
                    </h2>
                    <p className="mb-8 text-lg text-muted-foreground">
                        Join thousands of developers who use our tools every day to work faster and
                        smarter.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button size="lg" asChild>
                            <Link href="/json">
                                <FileCode className="mr-2 h-5 w-5" />
                                Start Using Tools
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/shortcuts">
                                <Keyboard className="mr-2 h-5 w-5" />
                                View Shortcuts
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
