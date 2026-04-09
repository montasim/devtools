import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { MenuItem } from './types';
import { MobileMenuItem } from './menu-items';
import Link from 'next/link';

interface MobileMenuProps {
    menu: MenuItem[];
    auth: {
        login: { title: string; url: string };
        signup: { title: string; url: string };
    };
}

export const MobileMenu = ({ menu, auth }: MobileMenuProps) => (
    <div className="block lg:hidden">
        <div className="flex items-center justify-between">
            <Logo />
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="size-4" />
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
                            {menu.map((item) => (
                                <MobileMenuItem key={item.title} item={item} />
                            ))}
                        </Accordion>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button asChild variant="outline">
                                <a href={auth.login.url}>{auth.login.title}</a>
                            </Button>
                            <Button asChild>
                                <a href={auth.signup.url}>{auth.signup.title}</a>
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    </div>
);
