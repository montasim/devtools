'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';
import { OtpInput } from '@/components/auth/otp-input';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Step = 'details' | 'otp';

export default function SignupPage() {
    useRedirectIfAuthenticated();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || searchParams.get('callbackUrl');
    const { signup } = useAuth();
    const [step, setStep] = useState<Step>('details');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [agreedToPolicies, setAgreedToPolicies] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        if (!agreedToPolicies) {
            toast.error('You must agree to the policies to create an account');
            return;
        }
        setLoading(true);
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
            setLoading(false);
        }
    }

    async function handleVerifyAndSignup(e: React.FormEvent) {
        e.preventDefault();
        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }
        setLoading(true);
        try {
            const success = await signup(email, otp, name);
            if (success) {
                toast.success('Account created successfully! Please sign in.');
                const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
                router.push(loginHref);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Signup failed');
        } finally {
            setLoading(false);
        }
    }

    const stepConfig = {
        details: {
            title: 'Create account',
            subtitle: 'Step 1 of 2: Enter your details',
        },
        otp: {
            title: 'Verify email',
            subtitle: `Step 2 of 2: Enter the 6-digit code sent to ${email}`,
        },
    };

    const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';

    return (
        <AuthPageLayout
            title={stepConfig[step].title}
            subtitle={stepConfig[step].subtitle}
            footer={
                <AuthFooter
                    linkText="Already have an account?"
                    linkHref={loginHref}
                    linkLabel="Sign in"
                />
            }
        >
            {step === 'details' && (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <FormField
                        id="name"
                        label="Full name"
                        type="text"
                        value={name}
                        onChange={setName}
                        placeholder="John Doe"
                        required
                    />
                    <FormField
                        id="email"
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="you@example.com"
                        required
                    />
                    <div className="flex items-start">
                        <input
                            id="agree-policies"
                            type="checkbox"
                            required
                            checked={agreedToPolicies}
                            onChange={(e) => setAgreedToPolicies(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="agree-policies" className="ml-2 block text-sm">
                            I agree to the{' '}
                            <Link href="/privacy" className="text-primary/90 hover:underline">
                                Privacy Policy
                            </Link>
                            ,{' '}
                            <Link href="/terms" className="text-primary/90 hover:underline">
                                Terms of Service
                            </Link>
                            , and{' '}
                            <Link href="/cookies" className="text-primary/90 hover:underline">
                                Cookie Policy
                            </Link>
                        </Label>
                    </div>
                    <Button type="submit" disabled={loading || !name.trim() || !email.trim() || !agreedToPolicies} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyAndSignup} className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <Label htmlFor="otp">Verification code</Label>
                        <OtpInput value={otp} onChange={setOtp} />
                    </div>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('details')}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button type="submit" disabled={loading || otp.length !== 6} className="flex-1">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify & Sign up
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageLayout>
    );
}
