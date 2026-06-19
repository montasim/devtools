'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { handleApiError } from '@/lib/hooks/use-error-handler';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    name: string;
    emailVerified: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, otp: string) => Promise<boolean>;
    signup: (email: string, otp: string, name?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateName: (name: string) => Promise<boolean>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data: sessionData, isPending: isLoading } = authClient.useSession();

    const user: User | null = sessionData?.user ? {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name || '',
        emailVerified: sessionData.user.emailVerified ? new Date().toISOString() : null,
    } : null;

    const login = useCallback(async (email: string, otp: string): Promise<boolean> => {
        try {
            const { error } = await authClient.signIn.emailOtp({ email, otp });
            if (error) {
                handleApiError(error.message ?? 'Login failed');
                return false;
            }
            return true;
        } catch (error) {
            handleApiError('Login failed', error);
            return false;
        }
    }, []);

    const signup = useCallback(
        async (email: string, otp: string, name?: string): Promise<boolean> => {
            try {
                const { error } = await authClient.signIn.emailOtp({ email, otp });
                if (error) {
                    handleApiError(error.message ?? 'Signup failed');
                    return false;
                }
                if (name) {
                    await authClient.updateUser({ name });
                }
                await authClient.signOut();
                return true;
            } catch (error) {
                handleApiError('Signup failed', error);
                return false;
            }
        },
        [],
    );

    const logout = useCallback(async () => {
        try {
            await authClient.signOut();
        } catch (error) {
            handleApiError('Logout failed', error);
        }
    }, []);

    const updateName = useCallback(async (name: string): Promise<boolean> => {
        try {
            const { error } = await authClient.updateUser({ name });
            if (error) {
                handleApiError(error.message ?? 'Failed to update name');
                return false;
            }
            return true;
        } catch (error) {
            handleApiError('Failed to update name', error);
            return false;
        }
    }, []);

    const updatePassword = useCallback(
        async (currentPassword: string, newPassword: string): Promise<boolean> => {
            toast.error('Password updates are not supported in passwordless authentication.');
            return false;
        },
        [],
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                updateName,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
