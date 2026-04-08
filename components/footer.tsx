import { FolderGit, Monitor, Palette, Rss } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';

const footerLinks = [
    { label: 'JSON', href: '/' },
    { label: 'TEXT', href: '/text' },
    { label: 'XML', href: '/xml' },
    { label: 'CSV', href: '/csv' },
];

const Footer = () => {
    return (
        <div className="flex flex-col">
            <div className="grow bg-muted" />
            <footer className="border-t">
                <div className="mx-auto max-w-(--breakpoint-3xl) px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start justify-between gap-x-8 gap-y-10 px-6 py-12 sm:flex-row xl:px-0">
                        <div>
                            <Logo />

                            <ul className="mt-6 flex flex-wrap items-center gap-4">
                                {footerLinks.map(({ label, href }) => (
                                    <li key={label}>
                                        <Link
                                            className="text-muted-foreground hover:text-foreground"
                                            href={href}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Subscribe Newsletter */}
                        <div className="w-full max-w-xs">
                            <h6 className="font-medium">Stay up to date</h6>
                            <form className="mt-6 flex items-center gap-2">
                                <Input placeholder="Enter your email" type="email" />
                                <Button>Subscribe</Button>
                            </form>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-5 px-6 py-8 sm:flex-row xl:px-0">
                        {/* Copyright */}
                        <span className="text-muted-foreground">
                            &copy; {new Date().getFullYear()}{' '}
                            <Link href="/" target="_blank">
                                Shadcn UI Blocks
                            </Link>
                            . All rights reserved.
                        </span>

                        <div className="flex items-center gap-5 text-muted-foreground">
                            <Link href="#" target="_blank">
                                <Rss className="h-5 w-5" />
                            </Link>
                            <Link href="#" target="_blank">
                                <Palette className="h-5 w-5" />
                            </Link>
                            <Link href="#" target="_blank">
                                <Monitor className="h-5 w-5" />
                            </Link>
                            <Link href="#" target="_blank">
                                <FolderGit className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
