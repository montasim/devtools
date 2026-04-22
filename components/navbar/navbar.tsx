'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { Logo } from '../layout/logo';
import { ThemeToggle } from '../theme/theme-toggle';
import { UserMenu } from '@/features/auth/components/user-menu';
import { navigationMenu } from '@/config/navigation';
import type { MenuItem } from '@/config/navigation';

function DropdownLink({ item }: { item: MenuItem }) {
    return (
        <a
            href={item.url}
            className="flex flex-row gap-3 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
        >
            {item.icon && <div className="shrink-0 text-foreground">{item.icon}</div>}
            <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{item.title}</div>
                {item.description && (
                    <p className="text-xs leading-snug text-muted-foreground">{item.description}</p>
                )}
            </div>
        </a>
    );
}

function HoverDropdown({ item }: { item: MenuItem }) {
    const items = item.items ?? [];
    const cols = items.length > 6 ? 3 : items.length > 3 ? 2 : 1;
    return (
        <div className="group relative">
            <Button variant="ghost" size="sm" className="gap-1">
                {item.title}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
            </Button>
            <div
                className={`${items.length > 4 ? 'h-92' : ''} overflow-y-auto overflow-x-hidden invisible absolute left-0 z-50 rounded-lg border bg-popover p-2 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100`}
            >
                <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(220px, 1fr))` }}
                >
                    {items.map((subItem) => (
                        <DropdownLink key={subItem.title} item={subItem} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function DesktopMenu() {
    return (
        <nav className="hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-6">
                <Logo />
                <div className="flex items-center gap-1">
                    {navigationMenu.map((item) =>
                        item.items ? (
                            <HoverDropdown key={item.title} item={item} />
                        ) : (
                            <Button key={item.title} variant="ghost" size="sm" asChild>
                                <Link href={item.url}>{item.title}</Link>
                            </Button>
                        ),
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
            </div>
        </nav>
    );
}

function MobileMenu() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center justify-between lg:hidden">
            <Logo />
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            <Link href="/" className="flex items-center gap-2">
                                <Logo />
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-6 p-4">
                        <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                            {navigationMenu.map((item) =>
                                item.items ? (
                                    <AccordionItem
                                        key={item.title}
                                        value={item.title}
                                        className="border-b-0"
                                    >
                                        <AccordionTrigger className="py-0 text-base font-semibold hover:no-underline">
                                            {item.title}
                                        </AccordionTrigger>
                                        <AccordionContent className="mt-2">
                                            {item.items.map((subItem) => (
                                                <DropdownLink key={subItem.title} item={subItem} />
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                ) : (
                                    <a
                                        key={item.title}
                                        href={item.url}
                                        className="text-base font-semibold"
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.title}
                                    </a>
                                ),
                            )}
                        </Accordion>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                        </div>
                        <UserMenu />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto px-4 py-2 sm:px-6 lg:px-8">
                <DesktopMenu />
                <MobileMenu />
            </div>
        </header>
    );
}
