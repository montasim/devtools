import Link from 'next/link';
import {
    Globe,
    Mail,
    Heart,
    Zap,
    Shield,
    Code2,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const values = [
    {
        icon: Shield,
        title: 'Privacy First',
        description:
            'All processing happens in your browser. Your data never leaves your device, ensuring complete privacy and security.',
    },
    {
        icon: Zap,
        title: 'Performance',
        description:
            'Lightning-fast tools built with modern web technologies. No server round-trips means instant results.',
    },
    {
        icon: Code2,
        title: 'Open Source',
        description:
            'Built with transparency in mind. Our code is open for inspection, contribution, and improvement by the community.',
    },
    {
        icon: Users,
        title: 'Developer Focused',
        description:
            'Designed by developers, for developers. Every feature is crafted to solve real-world development challenges.',
    },
];

const techStack = [
    'Next.js 16',
    'React 19',
    'TypeScript',
    'Tailwind CSS',
    'Lucide Icons',
    'Vitest',
];

const stats = [
    { label: 'Developer Tools', value: '6+' },
    { label: 'Features', value: '50+' },
    { label: '100% Client-Side', value: 'Privacy' },
    { label: 'Free Forever', value: '$0' },
];

export default function AboutPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="border-b bg-gradient-to-b from-background to-muted/20 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                        About{' '}
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            DevTools
                        </span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        A comprehensive suite of developer tools built with modern web technologies.
                        Completely free, open-source, and privacy-focused.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button size="lg" asChild>
                            <Link href="/">
                                <Code2 className="mr-2 h-5 w-5" />
                                Get Started
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Globe className="mr-2 h-5 w-5" />
                                View on GitHub
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-t px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="mb-2 text-4xl font-bold text-primary">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Our Mission
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Building the best developer tools, one tool at a time.
                        </p>
                    </div>

                    <div className="prose prose-lg dark:prose-invert mx-auto max-w-none">
                        <p>
                            DevTools was created to solve a common problem: developers need quick, reliable
                            tools to format, validate, and transform data without worrying about privacy or
                            paying for premium features.
                        </p>
                        <p>
                            We believe that essential developer tools should be free, fast, and respect your
                            privacy. That&apos;s why all our tools run entirely in your browser—your data never
                            leaves your device.
                        </p>
                        <p>
                            Whether you&apos;re debugging JSON, comparing text files, encoding Base64 data, or
                            generating consistent git branch names, our tools are designed to help you work
                            more efficiently.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Our Values
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            The principles that guide everything we build.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value) => (
                            <div key={value.title} className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <value.icon className="h-8 w-8" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
                                <p className="text-sm text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            Built With Modern Technology
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powered by the latest web technologies for optimal performance.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {techStack.map((tech) => (
                            <div
                                key={tech}
                                className="rounded-full border bg-card px-6 py-3 font-medium"
                            >
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Overview */}
            <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                            What We Offer
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            A comprehensive toolkit for all your development needs.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'JSON Tools',
                                description:
                                    'Format, validate, minify, parse, and export JSON with advanced features like schema generation and diff comparison.',
                                href: '/json',
                            },
                            {
                                title: 'Text Tools',
                                description:
                                    'Compare, convert, clean, and analyze text with powerful diff visualization and transformation capabilities.',
                                href: '/text',
                            },
                            {
                                title: 'Base64 Tools',
                                description:
                                    'Encode and decode Base64 data with support for media files and easy sharing.',
                                href: '/base64',
                            },
                            {
                                title: 'XML Tools',
                                description: 'Parse, validate, and convert XML data with a user-friendly interface.',
                                href: '/xml',
                            },
                            {
                                title: 'CSV Tools',
                                description: 'Convert, validate, and transform CSV data with ease.',
                                href: '/csv',
                            },
                            {
                                title: 'Git Branch Generator',
                                description: 'Generate consistent git branch names following best practices.',
                                href: '/git-branch-generator',
                            },
                        ].map((tool) => (
                            <Link
                                key={tool.title}
                                href={tool.href}
                                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5"
                            >
                                <h3 className="mb-2 text-lg font-semibold">{tool.title}</h3>
                                <p className="mb-4 text-sm text-muted-foreground">{tool.description}</p>
                                <span className="text-sm font-medium text-primary">
                                    Explore →
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                        Join Our Community
                    </h2>
                    <p className="mb-8 text-lg text-muted-foreground">
                        Help us build better developer tools. Star us on GitHub, share feedback, or
                        contribute to the project.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button size="lg" asChild>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Globe className="mr-2 h-5 w-5" />
                                Star on GitHub
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Globe className="mr-2 h-5 w-5" />
                                Follow on Twitter
                            </a>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/contact">
                                <Mail className="mr-2 h-5 w-5" />
                                Contact Us
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer Note */}
            <section className="border-t px-4 py-12 text-center sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <p className="flex items-center justify-center gap-2 text-muted-foreground">
                        Made with <Heart className="h-4 w-4 text-red-500" /> by developers, for developers
                    </p>
                </div>
            </section>
        </div>
    );
}
