'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    showStrengthIndicator?: boolean;
}

export function PasswordInput({ showStrengthIndicator = false, ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} {...props} />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                )}
            </Button>
        </div>
    );
}
