'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function isValidRedirect(url: string | null): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.origin === window.location.origin;
    } catch {
        return false;
    }
}

function LoginForm() {
    useRedirectIfAuthenticated();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Login successful');
            router.push(isValidRedirect(redirect) ? redirect! : '/json?tab=format');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthPageLayout
            title="Welcome back"
            subtitle="Sign in to your account"
            footer={
                <AuthFooter
                    linkText="Don't have an account?"
                    linkHref="/signup"
                    linkLabel="Sign up"
                />
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormField
                    id="email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    required
                />
                <FormField
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    required
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            className="h-4 w-4 rounded accent-primary"
                        />
                        <Label htmlFor="remember-me" className="ml-2 block text-sm">
                            Remember me
                        </Label>
                    </div>
                    <Link
                        href="/reset-password"
                        className="text-sm text-primary/90 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
        </AuthPageLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
