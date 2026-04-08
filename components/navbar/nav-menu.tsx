'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const navItems = [
    { label: 'JSON', href: '/' },
    { label: 'TEXT', href: '/text' },
    { label: 'XML', href: '/xml' },
    { label: 'CSV', href: '/csv' },
] as const;

const triggerStyle = navigationMenuTriggerStyle();

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="data-[orientation=vertical]:-ms-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
            {navItems.map(({ label, href }) => (
                <NavigationMenuItem key={label}>
                    <NavigationMenuLink asChild className={triggerStyle}>
                        <Link href={href}>{label}</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            ))}
        </NavigationMenuList>
    </NavigationMenu>
);
