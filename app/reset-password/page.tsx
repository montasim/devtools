'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Logo } from '@/components/layout/logo';

type Step = 'email' | 'reset';

export default function ResetPasswordPage() {
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
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <div className="flex justify-center">
                    <Logo />
                </div>
                {step === 'email' && (
                    <>
                        <div>
                            <h2 className="text-3xl font-bold text-center">Reset password</h2>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                Step 1 of 2: Enter your email
                            </p>
                        </div>
                        <form onSubmit={handleSendOTP} className="space-y-6">
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
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </form>
                    </>
                )}

                {step === 'reset' && (
                    <>
                        <div>
                            <h2 className="text-3xl font-bold text-center">Set new password</h2>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                Step 2 of 2: Enter OTP and new password
                            </p>
                        </div>
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
                                    onChange={(e) =>
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                                    }
                                    placeholder="123456"
                                    className="text-center text-2xl tracking-widest placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                />
                            </div>
                            <div>
                                <Label className="mb-2" htmlFor="password">
                                    New password
                                </Label>
                                <PasswordInput
                                    className="placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    id="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <Label className="mb-2" htmlFor="confirmPassword">
                                    Confirm new password
                                </Label>
                                <PasswordInput
                                    className="placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    id="confirmPassword"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
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
                                    {loading ? 'Resetting...' : 'Reset password'}
                                </Button>
                            </div>
                        </form>
                    </>
                )}

                <p className="text-center text-sm">
                    Remember your password?{' '}
                    <Link href="/login" className="font-medium text-primary/90 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
