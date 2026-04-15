'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Logo } from '@/components/layout/logo';

export default function LoginPage() {
    const router = useRouter();
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
            router.push('/json?tab=diff');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <div className="flex justify-center">
                    <Logo />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-center">Welcome back</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Sign in to your account
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            className="mt-2 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            className="mt-2 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                <p className="text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-primary/90 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
