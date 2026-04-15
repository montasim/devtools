'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';

type Step = 'email' | 'reset';

export default function ResetPasswordPage() {
    useRedirectIfAuthenticated();
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSendOTP(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/password-reset/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            toast.success('If email exists, OTP has been sent');
            setStep('reset');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/password-reset/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            toast.success('Password reset successful');
            router.push('/login');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthPageLayout
            title={step === 'email' ? 'Reset password' : 'Set new password'}
            subtitle={
                step === 'email'
                    ? 'Step 1 of 2: Enter your email'
                    : 'Step 2 of 2: Enter OTP and new password'
            }
            footer={
                <AuthFooter
                    linkText="Remember your password?"
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

            {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-6">
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
                    <FormField
                        id="password"
                        label="New password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        required
                    />
                    <FormField
                        id="confirmPassword"
                        label="Confirm new password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="••••••••"
                        required
                    />
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
                            {loading ? 'Resetting...' : 'Reset password'}
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageLayout>
    );
}
