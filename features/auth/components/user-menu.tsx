'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useLogoutConfirmDialog } from '@/components/auth/logout-confirm-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export function UserMenu() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    const { LogoutButton } = useLogoutConfirmDialog({
        onConfirm: async () => {
            try {
                await logout();
                toast.success('Logged out successfully');
                router.push('/');
            } catch {
                toast.error('Failed to logout');
            }
        },
    });

    if (!isAuthenticated) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href="/signup">Sign up</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">{user?.name}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => router.push('/profile')}
                        className="hover:bg-primary/10 focus:bg-primary/10"
                    >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                    >
                        <LogoutButton
                            variant="ghost"
                            className="w-full justify-start p-0 h-auto font-normal text-destructive hover:bg-transparent"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </LogoutButton>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
