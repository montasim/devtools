import Link from 'next/link';
import { Logo } from './logo';

const footerLinks = {
    tools: [
        { label: 'JSON Tools', href: '/json' },
        { label: 'Text Tools', href: '/text' },
        { label: 'Base64 Tools', href: '/base64' },
    ],
    resources: [{ label: 'History', href: '/history' }],
    legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
    ],
};

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background mt-10">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-3">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block">
                            <Logo />
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Powerful developer tools for JSON, text, and Base64 data processing.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Tools</h3>
                        <ul className="space-y-3">
                            {footerLinks.tools.map((link) => (
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
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
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
                <div className="border-t py-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm text-muted-foreground">
                            &copy; {currentYear} Developer Tools. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
