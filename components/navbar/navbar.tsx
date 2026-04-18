'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../layout/logo';
import { UserMenu } from '@/features/auth/components/user-menu';
import { ThemeToggle } from '../theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/json', label: 'JSON' },
    { href: '/text', label: 'Text' },
    { href: '/base64', label: 'Base64' },
];

export function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="flex h-14 items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
                <Logo />
                <div className="hidden items-center gap-6 md:flex">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                pathname?.startsWith(item.href)
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="hidden md:block">
                        <UserMenu />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </nav>
            {mobileOpen && (
                <div className="border-t md:hidden">
                    <div className="flex flex-col gap-2 px-4 py-4 sm:px-6 lg:px-8">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`rounded-md px-3 py-2 text-sm font-medium ${
                                    pathname?.startsWith(item.href)
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="mt-2 border-t pt-2">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
