'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';
import { OtpInput } from '@/components/auth/otp-input';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import AuthLoadingSkeleton from '@/app/(auth)/loading';

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
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'sign-in',
            });
            if (error) {
                toast.error(error.message ?? 'Failed to send OTP');
            } else {
                toast.success('OTP sent to your email');
                setStep('otp');
            }
        } catch (error) {
            toast.error('Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }
        setIsLoading(true);
        try {
            const success = await login(email, otp);
            if (success) {
                toast.success('Login successful');
                router.push(isValidRedirect(redirect) ? redirect! : '/json?tab=format');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthPageLayout
            title="Welcome back"
            subtitle={step === 'email' ? 'Sign in with one-time passcode' : `Enter the code sent to ${email}`}
            footer={
                <AuthFooter
                    linkText="Don't have an account?"
                    linkHref="/signup"
                    linkLabel="Sign up"
                />
            }
        >
            {step === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <FormField
                        id="email"
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="you@example.com"
                        required
                    />
                    <Button type="submit" disabled={isLoading || !email.trim()} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <Label htmlFor="otp">Verification code</Label>
                        <OtpInput value={otp} onChange={setOtp} />
                    </div>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('email')}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button type="submit" disabled={isLoading || otp.length !== 6} className="flex-1">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<AuthLoadingSkeleton />}>
            <LoginForm />
        </Suspense>
    );
}
