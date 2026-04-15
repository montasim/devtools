'use client';

import { Menu, User } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import { Logo } from '@/components/layout/logo';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { MenuItem } from '@/components/navbar/types';
import { MobileMenuItem } from '@/components/navbar/menu-items';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MobileMenuProps {
    menu: MenuItem[];
    auth: {
        login: { title: string; url: string };
        signup: { title: string; url: string };
    };
}

export const MobileMenu = ({ menu, auth }: MobileMenuProps) => {
    const [sheetOpen, setSheetOpen] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    async function handleLogout() {
        try {
            await logout();
            toast.success('Logged out successfully');
            setSheetOpen(false);
            router.push('/');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to logout');
        }
    }

    return (
        <div className="block lg:hidden">
            <div className="flex items-center justify-between">
                <Logo />
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
                            <Accordion
                                key={sheetOpen ? 'open' : 'closed'}
                                type="single"
                                collapsible
                                className="flex w-full flex-col gap-4"
                            >
                                {menu.map((item) => (
                                    <MobileMenuItem key={item.title} item={item} />
                                ))}
                            </Accordion>
                            <div className="flex items-center gap-3">
                                <ThemeSwitcher />
                            </div>
                            {user ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 rounded-lg border p-3">
                                        <User className="h-5 w-5" />
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            router.push('/profile');
                                            setSheetOpen(false);
                                        }}
                                    >
                                        Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            router.push('/settings');
                                            setSheetOpen(false);
                                        }}
                                    >
                                        Settings
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setLogoutDialogOpen(true)}
                                    >
                                        Log out
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button
                                        asChild
                                        variant="outline"
                                        onClick={() => setSheetOpen(false)}
                                    >
                                        <a href={auth.login.url}>{auth.login.title}</a>
                                    </Button>
                                    <Button asChild onClick={() => setSheetOpen(false)}>
                                        <a href={auth.signup.url}>{auth.signup.title}</a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>

                <ConfirmDialog
                    open={logoutDialogOpen}
                    onOpenChange={setLogoutDialogOpen}
                    title="Confirm Logout"
                    description="Are you sure you want to logout? You will need to sign in again to access your account."
                    confirmLabel="Logout"
                    cancelLabel="Cancel"
                    onConfirm={handleLogout}
                    variant="destructive"
                />
            </div>
        </div>
    );
};
