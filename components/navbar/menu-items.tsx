import { MenuItem } from '@/components/navbar/types';
import {
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface SubMenuLinkProps {
    item: MenuItem;
}

export const SubMenuLink = ({ item }: SubMenuLinkProps) => (
    <a
        className="flex flex-row gap-3 sm:gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground w-full"
        href={item.url}
    >
        <div className="text-foreground shrink-0">{item.icon}</div>
        <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{item.title}</div>
            {item.description && (
                <p className="text-xs sm:text-sm leading-snug text-muted-foreground">
                    {item.description}
                </p>
            )}
        </div>
    </a>
);

interface DesktopMenuItemProps {
    item: MenuItem;
}

export const DesktopMenuItem = ({ item }: DesktopMenuItemProps) => {
    if (item.items) {
        return (
            <NavigationMenuItem key={item.title}>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent className="!w-92 bg-popover text-popover-foreground">
                    {item.items.map((subItem) => (
                        <NavigationMenuLink asChild key={subItem.title}>
                            <SubMenuLink item={subItem} />
                        </NavigationMenuLink>
                    ))}
                </NavigationMenuContent>
            </NavigationMenuItem>
        );
    }

    return (
        <NavigationMenuItem key={item.title}>
            <NavigationMenuLink
                href={item.url}
                className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
            >
                {item.title}
            </NavigationMenuLink>
        </NavigationMenuItem>
    );
};

interface MobileMenuItemProps {
    item: MenuItem;
}

export const MobileMenuItem = ({ item }: MobileMenuItemProps) => {
    if (item.items) {
        return (
            <AccordionItem key={item.title} value={item.title} className="border-b-0">
                <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
                    {item.title}
                </AccordionTrigger>
                <AccordionContent className="mt-2">
                    {item.items.map((subItem) => (
                        <SubMenuLink key={subItem.title} item={subItem} />
                    ))}
                </AccordionContent>
            </AccordionItem>
        );
    }

    return (
        <a key={item.title} href={item.url} className="text-md font-semibold">
            {item.title}
        </a>
    );
};
