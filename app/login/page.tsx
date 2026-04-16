'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';

function isValidRedirect(url: string | null): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url, window.location.origin);
        // Only allow relative URLs or URLs on the same domain
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
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Login successful');
            // Use redirect parameter if provided and valid, otherwise fallback to default
            router.push(isValidRedirect(redirect) ? redirect! : '/json?tab=diff');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setLoading(false);
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
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
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
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
        </AuthPageLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
