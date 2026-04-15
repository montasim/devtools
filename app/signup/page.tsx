'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';

type Step = 'email' | 'otp' | 'account';

export default function SignupPage() {
    useRedirectIfAuthenticated();
    const router = useRouter();
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
            const res = await fetch('/api/auth/register/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            toast.success('OTP sent to your email');
            setStep('otp');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // Just verify OTP format, don't call API yet
            if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
                throw new Error('Invalid OTP format');
            }

            toast.success('OTP verified');
            setStep('account');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Invalid OTP');
        } finally {
            setLoading(false);
        }
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
            const res = await fetch('/api/auth/register/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp, name, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create account');
            }

            toast.success('Account created! Please login');
            router.push('/login');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create account');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthPageLayout
            title={
                step === 'email'
                    ? 'Create account'
                    : step === 'otp'
                      ? 'Verify email'
                      : 'Complete profile'
            }
            subtitle={
                step === 'email'
                    ? 'Step 1 of 3: Enter your email'
                    : step === 'otp'
                      ? `Step 2 of 3: Enter the 6-digit code sent to ${email}`
                      : 'Step 3 of 3: Create your password'
            }
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
                        {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </form>
            )}

            {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div>
                        <Label className="mb-2" htmlFor="otp">
                            Verification code
                        </Label>
                        <Input
                            id="otp"
                            type="text"
                            required
                            maxLength={6}
                            pattern="\d{6}"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            className="text-center text-2xl tracking-widest placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
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
                            {loading ? 'Verifying...' : 'Verify'}
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
                            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label
                            htmlFor="agree-policies"
                            className="ml-2 block text-sm text-gray-900"
                        >
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
                            {loading ? 'Creating...' : 'Create account'}
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageLayout>
    );
}
