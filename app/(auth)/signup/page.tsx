'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';
import { OtpInput } from '@/components/auth/otp-input';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Step = 'email' | 'otp' | 'account';

export default function SignupPage() {
    useRedirectIfAuthenticated();
    const router = useRouter();
    const { signup } = useAuth();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToPolicies, setAgreedToPolicies] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiClient.post('/api/auth/register/send-otp', { email });
            if (res.ok) {
                toast.success('OTP sent to your email');
                setStep('otp');
            } else {
                handleApiError(res.error?.message ?? 'Failed to send OTP');
            }
        } catch (error) {
            handleApiError('Failed to send OTP', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault();
        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }
        toast.success('OTP verified');
        setStep('account');
    }

    async function handleCreateAccount(e: React.FormEvent) {
        e.preventDefault();
        if (!agreedToPolicies) {
            toast.error('You must agree to the policies to create an account');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.post('/api/auth/register/verify-otp', {
                email,
                code: otp,
                name,
                password,
            });
            if (res.ok) {
                toast.success('Account created! Please login');
                router.push('/login');
            } else {
                handleApiError(res.error?.message ?? 'Failed to create account');
            }
        } catch (error) {
            handleApiError('Failed to create account', error);
        } finally {
            setLoading(false);
        }
    }

    const stepConfig = {
        email: {
            title: 'Create account',
            subtitle: 'Step 1 of 3: Enter your email',
        },
        otp: {
            title: 'Verify email',
            subtitle: `Step 2 of 3: Enter the 6-digit code sent to ${email}`,
        },
        account: {
            title: 'Complete profile',
            subtitle: 'Step 3 of 3: Create your password',
        },
    };

    return (
        <AuthPageLayout
            title={stepConfig[step].title}
            subtitle={stepConfig[step].subtitle}
            footer={
                <AuthFooter
                    linkText="Already have an account?"
                    linkHref="/login"
                    linkLabel="Sign in"
                />
            }
        >
            {step === 'email' && (
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
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
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
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify
                        </Button>
                    </div>
                </form>
            )}

            {step === 'account' && (
                <form onSubmit={handleCreateAccount} className="space-y-6">
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
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        required
                        minLength={8}
                    />
                    <FormField
                        id="confirmPassword"
                        label="Confirm password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="••••••••"
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
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('otp')}
                            className="flex-1"
                        >
                            Back
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Creating...' : 'Create account'}
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageLayout>
    );
}
