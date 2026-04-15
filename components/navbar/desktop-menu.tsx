'use client';

import { NavigationMenu, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { MenuItem } from '@/components/navbar/types';
import { DesktopMenuItem } from '@/components/navbar/menu-items';
import { Separator } from '@/components/ui/separator';
import { UserMenu } from '@/components/auth/user-menu';
import { useAuth } from '@/hooks/useAuth';

interface DesktopMenuProps {
    menu: MenuItem[];
    auth: {
        login: { title: string; url: string };
        signup: { title: string; url: string };
    };
}

export const DesktopMenu = ({ menu, auth }: DesktopMenuProps) => {
    const { user } = useAuth();

    return (
        <nav className="hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-6">
                <Logo />
                <div className="flex items-center">
                    <NavigationMenu viewport={false}>
                        <NavigationMenuList>
                            {menu.map((item) => (
                                <DesktopMenuItem key={item.title} item={item} />
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <ThemeSwitcher />

                <Separator orientation="vertical" />

                {user ? (
                    <UserMenu />
                ) : (
                    <>
                        <Button asChild variant="outline" size="sm">
                            <a href={auth.login.url}>{auth.login.title}</a>
                        </Button>
                        <Button asChild size="sm">
                            <a href={auth.signup.url}>{auth.signup.title}</a>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
};
