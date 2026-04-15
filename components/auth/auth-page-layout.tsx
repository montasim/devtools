import { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';

interface AuthPageLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthPageLayout({ title, subtitle, children, footer }: AuthPageLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <div className="flex justify-center">
                    <Logo />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-center">{title}</h2>
                    {subtitle && (
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>
                {children}
                {footer && <>{footer}</>}
            </div>
        </div>
    );
}
