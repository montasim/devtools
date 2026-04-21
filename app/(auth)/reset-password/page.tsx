'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AuthPageLayout } from '@/components/auth/auth-page-layout';
import { FormField } from '@/components/auth/form-field';
import { AuthFooter } from '@/components/auth/auth-footer';
import { OtpInput } from '@/components/auth/otp-input';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
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
                body: JSON.stringify({ email, otp, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');
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
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </form>
            )}

            {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="otp">Verification code</Label>
                        <OtpInput value={otp} onChange={setOtp} />
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
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Resetting...' : 'Reset password'}
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageLayout>
    );
}
