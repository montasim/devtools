import Link from 'next/link';
import { Logo } from './logo';
import { siteLinks } from '@/config/seo';
import { navigationMenu } from '@/config/navigation';
import { Braces, Hash, Network, Book, Wrench, BookOpen, Scale } from 'lucide-react';

const toolsItem = navigationMenu.find((item) => item.title === 'Tools');
const toolsEntries = toolsItem?.items ?? [];

const categoryMeta: { title: string; icon: React.ElementType }[] = [
    { title: 'Formatters & Converters', icon: Braces },
    { title: 'Generators', icon: Hash },
    { title: 'Network & API', icon: Network },
    { title: 'Reference', icon: Book },
    { title: 'Utilities', icon: Wrench },
];

const grouped = categoryMeta.map(({ title, icon }) => ({
    title,
    icon,
    links: toolsEntries
        .filter((item) => item.category === title)
        .map((item) => ({ label: item.title, href: item.url })),
}));

const resourceLinks =
    navigationMenu
        .find((item) => item.title === 'Resources')
        ?.items?.map((item) => ({ label: item.title, href: item.url })) ?? [];

const miscLinks = navigationMenu
    .filter((item) => item.title !== 'Tools' && !item.items)
    .map((item) => ({ label: item.title, href: item.url }));

const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimer', href: '/disclaimer' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-16 border-t">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 py-14 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <Logo />
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            30+ free developer tools that run entirely in your browser. No installs,
                            no sign-ups, no data leaves your machine.
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <Link
                                href={siteLinks.openSource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            >
                                <span className="sr-only">GitHub</span>
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </Link>
                            <Link
                                href={`mailto:${siteLinks.feedback}`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                            >
                                <span className="sr-only">Email</span>
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
                        {grouped.map(({ title, icon: Icon, links }) => (
                            <div key={title}>
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                                    <Icon className="h-4 w-4 text-primary" />
                                    {title}
                                </h3>
                                <ul className="space-y-2.5">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div>
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Resources
                            </h3>
                            <ul className="space-y-2.5">
                                {[...resourceLinks, ...miscLinks].map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t py-6">
                    <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
                        <p>
                            &copy; {currentYear} {siteLinks.name}. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            {legalLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
