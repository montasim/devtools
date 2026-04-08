'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Code, FileText, CodeXml, Table } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const navItems = [
    { label: 'JSON', href: '/', icon: Code },
    { label: 'TEXT', href: '/text', icon: FileText },
    { label: 'XML', href: '/xml', icon: CodeXml },
    { label: 'CSV', href: '/csv', icon: Table },
] as const;

const triggerStyle = navigationMenuTriggerStyle();

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="data-[orientation=vertical]:-ms-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
            {navItems.map(({ label, href, icon: Icon }) => (
                <NavigationMenuItem key={label}>
                    <NavigationMenuLink asChild className={triggerStyle}>
                        <Link href={href} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            ))}
        </NavigationMenuList>
    </NavigationMenu>
);
