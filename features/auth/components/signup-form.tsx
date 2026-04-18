'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/hooks/use-error-handler';
import { toast } from 'sonner';

interface SignupFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await apiClient.post('/api/auth/register/send-otp', { email });
            if (res.ok) {
                setOtpSent(true);
                toast.success('Verification code sent to your email');
            } else {
                handleApiError(res.error?.message ?? 'Failed to send verification code');
            }
        } catch (error) {
            handleApiError('Failed to send verification code', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await signup(email, password, name);
        setIsLoading(false);
        if (success) onSuccess?.();
    };

    if (!otpSent) {
        return (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                        id="signup-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                        minLength={8}
                    />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Verification Code
                </Button>
                {onSwitchToLogin && (
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-primary underline hover:no-underline"
                        >
                            Log in
                        </button>
                    </p>
                )}
            </form>
        );
    }

    return (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
                Enter the verification code sent to {email}
            </p>
            <div className="flex flex-col gap-2">
                <Label htmlFor="signup-otp">Verification Code</Label>
                <Input
                    id="signup-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter code"
                    required
                />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Create Account
            </Button>
        </form>
    );
}
