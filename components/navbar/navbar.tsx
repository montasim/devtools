import { cn } from '@/lib/utils';
import { navigationMenu, authButtons } from '@/config/navigation';
import { NavbarProps } from '@/components/navbar/types';
import { DesktopMenu } from '@/components/navbar/desktop-menu';
import { MobileMenu } from '@/components/navbar/mobile-menu';

export const Navbar = ({ menu = navigationMenu, auth = authButtons, className }: NavbarProps) => {
    return (
        <section className={cn('px-4 sm:px-6 lg:px-8 py-2 border-b relative z-50', className)}>
            <DesktopMenu menu={menu} auth={auth} />
            <MobileMenu menu={menu} auth={auth} />
        </section>
    );
};
