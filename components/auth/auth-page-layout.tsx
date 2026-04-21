import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';

interface AuthPageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthPageLayout({ title, subtitle, children, footer }: AuthPageLayoutProps) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg border bg-background p-4 shadow-sm">
                <div className="flex justify-center">
                    <Logo />
                </div>
                <div>
                    <h2 className="text-center text-3xl font-bold">{title}</h2>
                    {subtitle && (
                        <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                {children}
                {footer}
            </div>
        </div>
    );
}
